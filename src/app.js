'use strict'

import * as fragSrc from "./shaders/test.frag";
import * as vertSrc from "./shaders/test.vert";

import * as glm from "./gl-matrix.js"

import * as lenna from "../assets/img/lenna.png";

const imageBuffer = new Map();

// TODO: consider reducing amount of global variables
const canvas = document.querySelector('canvas');
const gl = canvas.getContext('webgl2', { antialias: false });

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

  // Right now the draw is not being executed every frame
  // Probably remove this once that is set up
  draw();
}

function loadImages(images) {
  return Promise.all(Object.entries(images).map(([name, url]) => loadImage(name, url)));
}

function loadImage(name, url) {
	return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = url;
    // This name is where the image will be stored in the global image buffer
    img.name = name;
    img.onerror = function(error) {
      reject(error);
    }
    img.onload = function() {
      resolve(img);
    };
  })
};

function createShader(gl, program, src, type) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  gl.attachShader(program, shader);

  const shaderLog = gl.getShaderInfoLog(shader);
  if(shaderLog)
    console.error(shaderLog);

  // Cleanup
  // The shader is attached to the program at this point so we don't need to keep it around
  gl.deleteShader(shader);
}

function createProgram(gl, shaders) {
  const program = gl.createProgram();

  createShader(gl, program, shaders.vertex, gl.VERTEX_SHADER);
  createShader(gl, program, shaders.fragment, gl.FRAGMENT_SHADER);

  gl.linkProgram(program);
  const linkLog = gl.getProgramInfoLog(program);
  if(linkLog)
    console.error(linkLog);

  return program;
}

function getLocations(gl, program, names) {
  const uniformNames = Object.entries(names.uniform);
  let uniform = {}
  uniformNames.forEach(([k, v]) => {
    uniform[k] = gl.getUniformLocation(program, v)
  });

  const attribNames = Object.entries(names.attribute);
  let attribute = {}
  attribNames.forEach(([k, v]) => {
    attribute[k] = gl.getAttribLocation(program, v)
  });

  return {uniform, attribute};
}

function draw() {

  const mat4 = glm.mat4;
  const vec3 = glm.vec3;

  // Create program and link shaders
  const program = createProgram(gl, {vertex: vertSrc, fragment: fragSrc});
  //Get locations of program's uniforms and attributes by name
  const locations = getLocations(gl, program, {
    uniform: {
      diffuse: 'diffuse',
      imageSize: 'imageSize',
      modelMatrix: 'model',
      viewMatrix: 'view',
      projectionMatrix : 'projection',
    },
    attribute: {
      position: 'position',
    },
  });

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  const positions = [
    -0.5, -0.8, 0.0, 1.0,
    -0.5, 0.5, 0.0, 1.0,
    0.5, 0.5, 0.0, 1.0,
    0.5, 0.5, 0.0, 1.0,
    0.5, -0.8, 0.0, 1.0,
    -0.5, -0.8, 0.0, 1.0,
  ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
  gl.vertexAttribPointer(locations.attribute.position, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(locations.attribute.position);

  // -- Init Texture
  const texture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imageBuffer.get('lenna'));
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // -- Render
  gl.clearColor(0.2, 0.2, 0.2, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.useProgram(program);
  gl.uniform1i(locations.uniform.diffuse, 0);
  gl.uniform2f(locations.uniform.imageSize, canvas.width / 3, canvas.height / 3);

  const projectionMatrix = mat4.create();
  mat4.perspective(
    projectionMatrix, // Destination matrix
    45 * Math.PI / 180, // FOV
    aspectRatio,
    0.1, // Near clipping plane
    100.0, // Far clipping plane
  );

  const viewMatrix = mat4.create();
  mat4.lookAt(
    viewMatrix, // Destination matrix
    vec3.fromValues(0.0, 0.0, 0.0), // Camera position
    vec3.fromValues(0.0, 0.0, 1.0), // View direction
    vec3.fromValues(0.0, 1.0, 0.0) // Up vector
  );

  const modelMatrix = mat4.create();
  mat4.translate(
    modelMatrix, // Destination matrix
    modelMatrix, // In matrix
    vec3.fromValues(1.0, 0.0, 3.0)
  );

  gl.uniformMatrix4fv(
    locations.uniform.projectionMatrix,
    false,
    projectionMatrix);

  gl.uniformMatrix4fv(
    locations.uniform.viewMatrix,
    false,
    viewMatrix);

  gl.uniformMatrix4fv(
    locations.uniform.modelMatrix,
    false,
    modelMatrix);

  gl.drawArrays(gl.TRIANGLES, 0, 6);
  // Delete WebGL resources
  gl.deleteTexture(texture);
  gl.deleteProgram(program);

}

function init() {

  const isWebGL2 = !!gl;
  if(!isWebGL2) {
    document.querySelector('body').style.backgroundColor = 'red';
    console.error("Unable to create webgl2 context");
    return;
  }

  loadImages({lenna}).then( images => {
    images.forEach(image => imageBuffer.set(image.name, image));

    // Resizing triggers a draw
    // Starting resizing here assures that images will be loaded first
    resize(canvas);
    window.addEventListener("resize", e=>resize(canvas));
  });

}

init();
