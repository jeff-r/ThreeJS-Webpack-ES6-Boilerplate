import * as THREE from 'three';

export default class Plot {
  constructor(phase) {
    console.log("Plot constructor");
    this.phase = phase;
    this.waves = this.waves.bind(this);
  }

  waves(x,y) {
    console.log("plot.waves");
    let xRange = 38;
    let yRange = 38;
    let scaleZ = 6;
    let offsetZ = 2;

    let xMin = -xRange/2;
    let yMin = -xRange/2;
    let xx = xRange * x + xMin;
    let yy = yRange * y + yMin;
    let distance = Math.sqrt(xx*xx+yy*yy);
    let z = offsetZ + scaleZ*Math.cos(distance+this.phase)/(distance + 1);

    if ( isNaN(z) )
      return new THREE.Vector3(0,0,0); // TODO: better fix
    else
      return new THREE.Vector3(xx, yy, z);
  }
}
