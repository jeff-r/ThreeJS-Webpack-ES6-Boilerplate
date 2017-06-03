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

    // Create and place geo in scene
    this.geometry = new Geometry(this.scene);
    this.geometry.make('plane')(150, 150, 10, 10);
    this.geometry.place([0, -20, 0], [Math.PI/2, 0, 0]);

    this.stats = new Stats(this.renderer);
    this.stats.initRStatsIfDev();

    // Instantiate texture class
    this.texture = new Texture();

    // Start loading the textures and then go on to load the model after the texture Promises have resolved
    this.texture.load().then(() => {
      this.initModel();
    });

    // Start render which does not wait for model fully loaded
    this.render();
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

    // Add dat.GUI controls if dev
    if(this.stats.showStats()) {
      new DatGUI(this, this.model.obj);
    }

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
