import * as Util from "../util.js";
import * as Keyboard from "../keyboard.js";
import * as Mouse from "../mouse.js";

import * as glm from "../gl-matrix.js";

const mat4 = glm.mat4;
const vec3 = glm.vec3;
const quat = glm.quat;

const up = vec3.fromValues(0, 1, 0);
const movementVelocity = 0.1;

export default class Camera {

  constructor(pos) {
    this.matrix = mat4.create();
    this.pos = pos;
    this.direction = vec3.fromValues(0, 0, 1);
    this.directionNorm = vec3.create();

    this.rotato = quat.create();
    this.totalRotX = 0;
    this.totalRotY = 0;
    this.update();
  }

  draw() {}

  update() {
    const rotationX = Mouse.movementX * 0.001;
    const rotationY = Mouse.movementY * 0.001;

    this.totalRotX -= rotationX;
    this.totalRotY -= rotationY;

    // TODO this shouldn't be here, move this to utilities?
    function rotate(out, vec, q) {
      const temp = quat.fromValues(vec[0], vec[1], vec[2], 0);
      const temp2 = quat.create();
      quat.multiply(temp2, q, temp);
      quat.conjugate(temp, q);
      quat.multiply(temp2, temp2, temp);

      out[0] = temp2[0];
      out[1] = temp2[1];
      out[2] = temp2[2];
      return out;
    }

    // Not sure if there is a better way to do this, this seems bad
    // First rotate by the x amount
    this.rotato = quat.setAxisAngle(this.rotato, vec3.fromValues(0,1,0), this.totalRotX);
    rotate(this.direction, vec3.fromValues(0,0,1), this.rotato);
    // Next find the axis for the next rotation
    // We need the axis of rotation to be normal to the direction vector and the y axis
    vec3.cross(this.directionNorm, this.direction, vec3.fromValues(0,1,0));
    // Now rotate again
    this.rotato = quat.setAxisAngle(this.rotato, this.directionNorm, this.totalRotY);
    rotate(this.direction, this.direction, this.rotato);


    // Janky, clean up
    let directionX = 0;
    if (Keyboard.keys[65] && Keyboard.keys[68])
      directionX = (Keyboard.timestamps[68] > Keyboard.timestamps[65]) ? -1 : 1;
    else if (Keyboard.keys[65] || Keyboard.keys[68])
      directionX = Keyboard.keys[68] ? -1 : 1;
    else
      directionX = 0;

    // Janky, clean up
    let directionZ = 0;
    if (Keyboard.keys[83] && Keyboard.keys[87])
      directionZ = (Keyboard.timestamps[83] > Keyboard.timestamps[87]) ? -1 : 1;
    else if (Keyboard.keys[83] || Keyboard.keys[87])
      directionZ = Keyboard.keys[83] ? -1 : 1;
    else
      directionZ = 0;


    const viewDir = Math.atan2(this.direction[0], this.direction[2]);
    const movementDir = vec3.create();
    vec3.rotateY(movementDir, vec3.fromValues(directionX, 0, directionZ), vec3.create(), viewDir);
    // Branch here to avoid divide by zero
    if(vec3.length(movementDir) > 0)
      vec3.scale(movementDir, movementDir, 1/vec3.length(movementDir) * movementVelocity)

    vec3.add(this.pos, this.pos, movementDir)
    const aimVector = vec3.create();
    vec3.add(aimVector, this.pos, this.direction);
    mat4.lookAt(this.matrix, this.pos, aimVector, up);

  }
}
