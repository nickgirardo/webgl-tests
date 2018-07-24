import * as Util from "./engine/util.js";
import * as Keyboard from "./engine/keyboard.js";
import * as Mouse from "./engine/mouse.js";
import { vec3 } from "./engine/gl-matrix.js";

import Camera from "./entities/camera.js";
import Crate from "./entities/crate.js";
import Test from "./entities/test.js";
import Foo from "./entities/foo.js";
import Skybox from "./entities/skybox.js";

// TODO: consider reducing amount of global variables
const canvas = document.querySelector('canvas');
const gl = canvas.getContext('webgl2', { antialias: false });

const aspectRatio = 16/9;

const scene = [];
// Create a new camera at the origin
const camera = new Camera(vec3.fromValues(0, 0, 0));

function draw() {
  gl.clearColor(0.2, 0.2, 0.2, 1.0); // Clear background with dark grey color
  gl.clearDepth(1.0); // Clear the depth buffer
  gl.enable(gl.DEPTH_TEST); // Enable depth testing, insures correct ordering
  gl.depthFunc(gl.LEQUAL); // Near obscures far

  // Clear canvas
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Draw each individual element
  scene.forEach(t=>t.draw(canvas, gl, camera.matrix));
}

function update() {
  // currently camera must be updated before mouse
  // this is probably undesired behaviour and updates
  // should be roughly possible in an order so try to fix
  scene.forEach(e=>e.update())
  draw();
  Mouse.update();
  window.requestAnimationFrame(update);
}

function init() {

  Keyboard.init();
  Mouse.init(canvas);

  const isWebGL2 = !!gl;
  if(!isWebGL2) {
    document.querySelector('body').style.backgroundColor = 'red';
    console.error("Unable to create webgl2 context");
    return;
  }

  const pos1 = vec3.fromValues(1, 0, 3);
  const pos2 = vec3.fromValues(-1, 0, 3);
  const pos3 = vec3.fromValues(0, 0, 8);

  const cratePos = vec3.fromValues(0, 0, 5);


  Promise.all([
    Test.create(gl, pos1),
    Test.create(gl, pos2),
    Foo.create(gl, pos3),
    Crate.create(gl, cratePos),
    Skybox.create(gl)
  ]).then((tests) => {
    tests.forEach(t=>scene.push(t));

    scene.push(camera);

    Util.resize(gl, canvas, aspectRatio);
    window.addEventListener("resize", e=>Util.resize(gl, canvas, aspectRatio));

    update();
  });

}

init();
