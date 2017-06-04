import * as THREE from 'three';

export default class Plot {
  constructor(linearSegments, phase) {
    console.log("Plot constructor");
    this.phase = phase;
    this.phaseDelta     = 0.05;
    this.linearSegments = linearSegments;
    this.waves          = this.waves.bind(this);
    this.wavesWithPhase = this.wavesWithPhase.bind(this);
    this.segments       = this.segments.bind(this);
    this.plotFunction   = this.plotFunction.bind(this);
  }

  segments() {
    return this.linearSegments;
  }

  updateWaves(vertices) {
    this.phase -= this.phaseDelta;
    for (let n=0; n<vertices.length; n++) {
      let vertex = vertices[n];
      vertices[n].z = this.plotFunction(vertex.x, vertex.y, this.phase);
    }
  }

  waves(x,y) {
    return this.wavesWithPhase(x,y, this.phase);
  }

  plotFunction(x,y,phase) {
    let scaleZ = .8;
    let offsetZ = 3;
    let distance = Math.sqrt(x*x+y*y);
    let ripples = scaleZ*Math.cos(distance+phase);
    let ywaves = 0.5*Math.cos(y+phase);
    let xwaves = 0.5*Math.cos(x+phase);
    return offsetZ + ripples + xwaves;
  }

  wavesWithPhase(x,y, phase) {
    let xRange = 38;
    let yRange = 38;

    let xMin = -xRange/2;
    let yMin = -xRange/2;
    let xx = xRange * x + xMin;
    let yy = yRange * y + yMin;
    let z = this.plotFunction(xx,yy,phase);

    if ( isNaN(z) )
      return new THREE.Vector3(0,0,0); // TODO: better fix
    else
      return new THREE.Vector3(xx, yy, z);
  }
}
