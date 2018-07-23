import * as Util from "../engine/util.js";
import * as Keyboard from "../engine/keyboard.js";
import * as Mouse from "../engine/mouse.js";

import {mat4, vec3, quat} from "../engine/gl-matrix.js";

const up = vec3.fromValues(0, 1, 0);
const movementVelocity = 0.1;

export default class Camera {

  constructor(pos) {
    this.matrix = mat4.create();
    this.pos = pos;
    this.direction = vec3.fromValues(0, 0, 1);
    this.directionNorm = vec3.create();

    this.rotQuat = quat.create();
    this.totalRotX = 0;
    this.totalRotY = 0;
    this.update();
  }

  draw() {}

  update() {
    function moreRecentPress(a, b) {
      if (Keyboard.keys[a] && Keyboard.keys[b])
        return (Keyboard.timestamps[b] > Keyboard.timestamps[a]) ? -1 : 1;
      else if (Keyboard.keys[a] || Keyboard.keys[b])
        return Keyboard.keys[b] ? -1 : 1;
      else
        return 0;
    }

    let directionX = moreRecentPress(65, 68);
    let directionZ = moreRecentPress(87, 83);

    this.totalRotX -= Mouse.movementX * 0.001;
    this.totalRotY -= Mouse.movementY * 0.001;

    // Not sure if there is a better way to do this, this seems bad
    // First rotate by the x amount
    this.rotQuat = quat.setAxisAngle(this.rotQuat, vec3.fromValues(0,1,0), this.totalRotX);
    Util.rotate(this.direction, vec3.fromValues(0,0,1), this.rotQuat);
    // Next find the axis for the next rotation
    // We need the axis of rotation to be normal to the direction vector and the y axis
    vec3.cross(this.directionNorm, this.direction, vec3.fromValues(0,1,0));
    // Now rotate again
    this.rotQuat = quat.setAxisAngle(this.rotQuat, this.directionNorm, this.totalRotY);
    Util.rotate(this.direction, this.direction, this.rotQuat);

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
