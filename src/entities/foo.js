import * as Util from "../util.js";

import * as fragSrc from "../shaders/screenSpaceInv.frag";
import * as vertSrc from "../shaders/mvp.vert";

import * as bold from "../../assets/img/boldAndBrash.png";
import * as glm from "../gl-matrix.js";

const mat4 = glm.mat4;
const vec3 = glm.vec3;

export default class Foo {

  constructor() {}

  async init(gl, pos) {
    this.pos = pos;
    this.diffuseImg = await Util.loadImage(bold);

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
      -0.8, -0.8, 0.0, 1.0,
      -0.8, 0.8, 0.0, 1.0,
      0.8, 0.8, 0.0, 1.0,
      0.8, 0.8, 0.0, 1.0,
      0.8, -0.8, 0.0, 1.0,
      -0.8, -0.8, 0.0, 1.0,
    ];

    this.positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.positions), gl.STATIC_DRAW);

    // -- Init Texture
    this.diffuse = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.diffuse);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.diffuseImg);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  }

  // Janky hack because I want an asynchronous constructor
  static async create(gl, pos) {
    const o = new Foo();
    await o.init(gl, pos);
    return o;
  }

  draw(canvas, gl, camera) {
    gl.useProgram(this.programInfo.program);

    gl.uniform2f(this.programInfo.locations.uniform.imageSize, canvas.width / 16, canvas.height / 9);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.diffuse);
    gl.uniform1i(this.programInfo.locations.uniform.diffuse, 0);

    gl.enableVertexAttribArray(this.programInfo.locations.attribute.position);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.vertexAttribPointer(this.programInfo.locations.attribute.position, 4, gl.FLOAT, false, 0, 0);

    const projectionMatrix = mat4.create();
    mat4.perspective(
      projectionMatrix, // Destination matrix
      45 * Math.PI / 180, // FOV
      16/9, // Aspect ratio
      0.1, // Near clipping plane
      100.0, // Far clipping plane
    );

    const viewMatrix = camera;

    const modelMatrix = mat4.create();
    mat4.translate(
      modelMatrix, // Destination matrix
      modelMatrix, // In matrix
      this.pos
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
    gl.disableVertexAttribArray(this.programInfo.locations.attribute.position);
  }

}
