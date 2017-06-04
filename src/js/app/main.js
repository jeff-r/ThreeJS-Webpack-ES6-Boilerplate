// Global imports -
import * as THREE from 'three';
import TWEEN from 'tween.js';

// Local imports -
// Components
import Renderer from './components/renderer';
import Camera from './components/camera';
import Light from './components/light';
import Controls from './components/controls';

// Helpers
import Geometry from './helpers/geometry';

// Model
import Texture from './model/texture';
import Model from './model/model';

// Managers
import Interaction from './managers/interaction';
import DatGUI from './managers/datGUI';

// data
import Config from './../data/config';

import Stats from './helpers/stats';
import Plot  from './model/plot';
// -- End of imports

// This class instantiates and ties all of the components together, starts the loading process and renders the main loop
export default class Main {
  constructor(container) {
    // Set container property to container element
    this.container = container;

    // Start Three clock
    this.clock = new THREE.Clock();

    // Main scene creation
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(Config.fog.color, Config.fog.near);

    // Get Device Pixel Ratio first for retina
    if(window.devicePixelRatio) {
      Config.dpr = window.devicePixelRatio;
    }

    // Main renderer instantiation
    this.renderer = new Renderer(this.scene, container);

    // Components instantiation
    this.camera = new Camera(this.renderer.threeRenderer);
    this.controls = new Controls(this.camera.threeCamera, container);
    this.light = new Light(this.scene);

    // Create and place lights in scene
    const lights = ['ambient', 'directional', 'point', 'hemi'];
    for(let i = 0; i < lights.length; i++) {
      this.light.place(lights[i]);
    }

    this.stats = new Stats(this.renderer);
    this.stats.initRStatsIfDev();

    this.finalizeDisplay();

    this.plot = new Plot(80, 1.2);
    this.addScratchObjects();
    this.plot.updateWaves(this.plotGeometry.vertices);
    // Start render which does not wait for model fully loaded
    this.render();
  }

  hsl(hue, saturation, lightness) {
    return new THREE.Color("hsl(" + hue + ", " + saturation + "%, " + lightness + "%)")
  }

  addScratchObjects() {
    let segments = this.plot.segments();
    console.log("Adding plot.waves");
    this.plotGeometry = new THREE.ParametricGeometry(this.plot.waves, segments, segments, true);
    console.log(this.plotGeometry);
    let plotProperties = {
      color: this.hsl(180,50,80),
    }
    let plotMaterial = new THREE.MeshLambertMaterial(plotProperties);
    let plotMesh = new THREE.Mesh(this.plotGeometry, plotMaterial);
    this.scene.add(plotMesh);
  }

  finalizeDisplay() {
    // Set up interaction manager with the app now that the model is finished loading
    new Interaction(this.renderer.threeRenderer, this.scene, this.camera.threeCamera, this.controls.threeControls);

    // Everything is now fully loaded
    Config.isLoaded = true;
    this.container.querySelector('#loading').style.display = 'none';
  }

  render() {
    this.stats.renderStatsBegin();
    this.plot.updateWaves(this.plotGeometry.vertices);
    this.plotGeometry.verticesNeedUpdate = true;

    // Call render function and pass in created scene and camera
    this.renderer.render(this.scene, this.camera.threeCamera);

    this.stats.renderStatsEnd();

    // Delta time is sometimes needed for certain updates
    //const delta = this.clock.getDelta();

    // Call any vendor or module updates here
    TWEEN.update();
    this.controls.threeControls.update();

    requestAnimationFrame(this.render.bind(this)); // Bind the main class instead of window object
  }
}
