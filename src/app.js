import Test from "./entities/test.js";
import Foo from "./entities/foo.js";
import * as K from "./keyboard.js";
import * as Mouse from "./mouse.js";
import * as glm from "./gl-matrix.js";

// TODO: consider reducing amount of global variables
const canvas = document.querySelector('canvas');
const gl = canvas.getContext('webgl2', { antialias: false });


const scene = [];

const aspectRatio = 16/9;

let camera = glm.mat4.create();
let cameraPos = glm.vec3.fromValues(0, 0, 0);
let rotationX = 0;
let rotationY = 0;

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
  gl.clearColor(0.2, 0.2, 0.2, 1.0); // Clear background with dark grey color
  gl.clearDepth(1.0); // Clear the depth buffer
  gl.enable(gl.DEPTH_TEST); // Enable depth testing, insures correct ordering
  gl.depthFunc(gl.LEQUAL); // Near obsucres far

  // Clear canvas
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Draw each individual element
  scene.forEach(t=>t.draw(canvas, gl, camera));
}

function update() {
  // All of this control code being here is temporary and will be moved soon
  const mat4 = glm.mat4;
  const vec3 = glm.vec3;
  const up = vec3.fromValues(0, 1, 0);

  let directionR = 0;
  rotationX -= Mouse.movementX * 0.001;
  rotationY += Mouse.movementY * 0.001;

  const cameraDirection = vec3.fromValues(0,0,1);
  // Not sure these operations in this order produce correct values, should be close enough for now
  vec3.rotateY(cameraDirection, cameraDirection, vec3.create(), rotationX);
  vec3.rotateX(cameraDirection, cameraDirection, vec3.create(), rotationY);


  let directionX = 0;
  if (K.keys[65] && K.keys[68])
    directionX = (K.timestamps[68] > K.timestamps[65]) ? -1 : 1;
  else if (K.keys[65] || K.keys[68])
    directionX = K.keys[68] ? -1 : 1;
  else
    directionX = 0;

  let directionZ = 0;
  if (K.keys[83] && K.keys[87])
    directionZ = (K.timestamps[83] > K.timestamps[87]) ? -1 : 1;
  else if (K.keys[83] || K.keys[87])
    directionZ = K.keys[83] ? -1 : 1;
  else
    directionZ = 0;

  const movementDir = vec3.create();
  vec3.rotateY(movementDir, vec3.fromValues(directionX * 0.1, 0, directionZ * 0.1), vec3.create(), rotationX);

  vec3.add(cameraPos, cameraPos, movementDir)
  const cameraAim = vec3.create();
  vec3.add(cameraAim, cameraPos, cameraDirection);
  mat4.lookAt(camera, cameraPos, cameraAim, up);

  Mouse.update();
  draw();
  window.requestAnimationFrame(update);
}

function init() {

  K.init();

  Mouse.init(canvas);


  const isWebGL2 = !!gl;
  if(!isWebGL2) {
    document.querySelector('body').style.backgroundColor = 'red';
    console.error("Unable to create webgl2 context");
    return;
  }

  const pos1 = glm.vec3.fromValues(1, 0, 3);
  const pos2 = glm.vec3.fromValues(-1, 0, 3);
  const pos3 = glm.vec3.fromValues(0, 0, 8);

  Promise.all([Test.create(gl, pos1), Test.create(gl, pos2), Foo.create(gl, pos3)]).then((tests) => {
    tests.forEach(t=>scene.push(t));

    resize(canvas);
    window.addEventListener("resize", e=>resize(canvas));

    update();
  });

}

init();
