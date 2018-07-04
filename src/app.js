'use strict'

import * as fragSrc from "./shaders/test.frag";
import * as vertSrc from "./shaders/test.vert";


function resize(canvas) {
  // Among other things, this method makes sure the game is always 16/9
  const desiredAspectRatio = 16/9;
  const scaleFactor = 0.9;

  let wWidth = window.innerWidth;
  let wHeight = window.innerHeight;

  let aspectRatio = wWidth/ wHeight;

  if(aspectRatio > desiredAspectRatio) {
    canvas.width = wHeight * desiredAspectRatio * scaleFactor;
    canvas.height = wHeight * scaleFactor;
  } else {
    canvas.width = wWidth * scaleFactor;
    canvas.height = wWidth / desiredAspectRatio * scaleFactor;
  };
}

resize(document.querySelector('canvas'));

function loadImage(url) {
	return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = url;
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

(function() {
  const canvas = document.querySelector('canvas');
  const gl = canvas.getContext('webgl2', { antialias: false });

  const isWebGL2 = !!gl;
  if(!isWebGL2) {
    console.error("Unable to create webgl2 context");
    return;
  }

  // Create program and link shaders
  const program = createProgram(gl, {vertex: vertSrc, fragment: fragSrc});

  const diffuseLocation = gl.getUniformLocation(program, 'diffuse');
  const imageSizeLocation = gl.getUniformLocation(program, 'u_imageSize');
  const positionLocation = gl.getAttribLocation(program, 'a_position');

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  const positions = [
    -0.5, -0.8,
    -0.5, 0.5,
    0.5, 0.5,
    0.5, 0.5,
    0.5, -0.8,
    -0.5, -0.8,
  ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(positionLocation);

  loadImage('../assets/img/lenna.png').then(image => {
    // -- Init Texture
    const texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // -- Render
    gl.clearColor(0.2, 0.2, 0.2, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    gl.uniform1i(diffuseLocation, 0);
    gl.uniform2f(imageSizeLocation, canvas.width / 3, canvas.height / 3);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
    // Delete WebGL resources
    gl.deleteTexture(texture);
    gl.deleteProgram(program);
  });

})();



