
import * as Util from "../util.js";

import * as fragSrc from "../shaders/test.frag";
import * as vertSrc from "../shaders/test.vert";

import * as lenna from "../../assets/img/lenna.png";
import * as glm from "../gl-matrix.js";

const mat4 = glm.mat4;
const vec3 = glm.vec3;

export default class Test {

  constructor() {}

  async init(gl) {
    this.diffuseImg = await Util.loadImage('lenna', lenna);

    // Create program and link shaders
    this.programInfo = Util.createProgram(gl, {vertex: vertSrc, fragment: fragSrc}, {
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

    this.positions = [
      -0.5, -0.8, 0.0, 1.0,
      -0.5, 0.5, 0.0, 1.0,
      0.5, 0.5, 0.0, 1.0,
      0.5, 0.5, 0.0, 1.0,
      0.5, -0.8, 0.0, 1.0,
      -0.5, -0.8, 0.0, 1.0,
    ];

    this.positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.positions), gl.STATIC_DRAW);
    gl.vertexAttribPointer(this.programInfo.locations.attribute.position, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.programInfo.locations.attribute.position);


    // -- Init Texture
    const texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.diffuseImg);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  }

  static async create(gl) {
    const o = new Test();
    await o.init(gl);
    return o;
  }

  draw(canvas, gl) {
    const time = performance.now() / 1000;

    gl.useProgram(this.programInfo.program);
    gl.uniform1i(this.programInfo.locations.uniform.diffuse, 0);
    gl.uniform2f(this.programInfo.locations.uniform.imageSize, canvas.width / 3, canvas.height / 3);

    const projectionMatrix = mat4.create();
    mat4.perspective(
      projectionMatrix, // Destination matrix
      45 * Math.PI / 180, // FOV
      16/9, // Aspect ratio
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
      vec3.fromValues(1.0+Math.sin(time), 0.0, 3.0)
    );

    gl.uniformMatrix4fv(
      this.programInfo.locations.uniform.projectionMatrix,
      false,
      projectionMatrix);

    gl.uniformMatrix4fv(
      this.programInfo.locations.uniform.viewMatrix,
      false,
      viewMatrix);

    gl.uniformMatrix4fv(
      this.programInfo.locations.uniform.modelMatrix,
      false,
      modelMatrix);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
  
}
