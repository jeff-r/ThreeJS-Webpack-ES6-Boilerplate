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

    // this.initBaseModelAndTexture();
    this.finalizeDisplay();

    this.addScratchObjects();
    // Start render which does not wait for model fully loaded
    this.render();
  }

  plot(phase) {
    return function(x,y) {
      let xRange = 38;
      let yRange = 38;
      let scaleZ = 6;
      let offsetZ = 2;

      let xMin = -xRange/2;
      let yMin = -xRange/2;
      let xx = xRange * x + xMin;
      let yy = yRange * y + yMin;
      let distance = Math.sqrt(xx*xx+yy*yy);
      let z = offsetZ + scaleZ*Math.cos(distance+phase)/(distance + 1);

      if ( isNaN(z) )
        return new THREE.Vector3(0,0,0); // TODO: better fix
      else
        return new THREE.Vector3(xx, yy, z);
    }
  }

  hsl(hue, saturation, lightness) {
    return new THREE.Color("hsl(" + hue + ", " + saturation + "%, " + lightness + "%)")
  }

  addScratchObjects() {
    let segments = 200;
    let plotGeometry = new THREE.ParametricGeometry(this.plot(0.1), segments, segments, true);
    let plotProperties = {
      color: this.hsl(180,50,80),
    }
    let plotMaterial = new THREE.MeshLambertMaterial(plotProperties);
    let plotMesh = new THREE.Mesh(plotGeometry, plotMaterial);
    this.scene.add(plotMesh);

    // let ballProperties = {
    //   color: this.hsl(0, 50, 80),
    //   shininess: 255,
    //   specular: this.hsl(60, 20, 10)
    // }
    // let ballMaterial = new THREE.MeshPhongMaterial(ballProperties);
    // let ballGeometry = new THREE.SphereGeometry(14,50,50);
    // var ball = new THREE.Mesh(ballGeometry, ballMaterial);
    // ball.position.x = 0;
    // ball.position.y = 0;
    // ball.position.z = 50;
    // ball.castShadow = true;
    // this.scene.add(ball);

    // let boxProperties = {
    //   color: this.hsl(180,50,80),
    //   shininess: 255,
    //   specular: 0xff8888
    // }
    // let boxMaterial = new THREE.MeshLambertMaterial(boxProperties);
    // let boxGeometry = new THREE.BoxGeometry(10,10,10);
    // var box = new THREE.Mesh(boxGeometry, boxMaterial);
    // box.position.x = 50;
    // box.position.y = 0;
    // box.position.z = 0;
    // box.castShadow = true;
    // this.scene.add(box);
  }

  initBaseModelAndTexture() {
    // Instantiate texture class
    this.texture = new Texture();

    // Start loading the textures and then go on to load the model after the texture Promises have resolved
    this.texture.load().then(() => {
      this.initModel();
    });

  }

  initModel() {
    this.manager = new THREE.LoadingManager();

    // Textures loaded, load model
    this.model = new Model(this.scene, this.manager, this.texture.textures);
    this.model.load();

    // onProgress callback
    this.manager.onProgress = (item, loaded, total) => {
      console.log(`${item}: ${loaded} ${total}`);
    };

    // All loaders done now
    this.manager.onLoad = () => {
      this.finalizeDisplay();
    };
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
