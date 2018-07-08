'use strict'

import * as glm from "./gl-matrix.js";

import * as fragSrc from "./shaders/test.frag";
import * as vertSrc from "./shaders/test.vert";

import Test from "./entities/test.js";

// TODO: consider reducing amount of global variables
const canvas = document.querySelector('canvas');
const gl = canvas.getContext('webgl2', { antialias: false });

const scene = [];

const aspectRatio = 16/9;

function resize(canvas) {
  // Among other things, this method makes sure the game is always 16/9
  const scaleFactor = 0.9;

  let wWidth = window.innerWidth;
  let wHeight = window.innerHeight;

  let windowAspectRatio = wWidth/ wHeight;

  if(windowAspectRatio > aspectRatio) {
    canvas.width = wHeight * aspectRatio * scaleFactor;
    canvas.height = wHeight * scaleFactor;
  } else {
    canvas.width = wWidth * scaleFactor;
    canvas.height = wWidth / aspectRatio * scaleFactor;
  };

  gl.viewport(0, 0, canvas.width, canvas.height);
}

function draw() {
  gl.clearColor(0.2, 0.2, 0.2, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  scene.forEach(t=>t.draw(canvas,gl));
}

function update() {
  draw();
  window.requestAnimationFrame(update);
}

function init() {

  const isWebGL2 = !!gl;
  if(!isWebGL2) {
    document.querySelector('body').style.backgroundColor = 'red';
    console.error("Unable to create webgl2 context");
    return;
  }

  const pos1 = glm.vec3.fromValues(1, 0, 3);
  const pos2 = glm.vec3.fromValues(-1, 0, 3);

  Promise.all([Test.create(gl, pos1), Test.create(gl, pos2)]).then((tests) => {
    tests.forEach(t=>scene.push(t));

    resize(canvas);
    window.addEventListener("resize", e=>resize(canvas));

    update();
  });

}

init();
