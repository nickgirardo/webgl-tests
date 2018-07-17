import * as Util from "../util.js";

import * as fragSrc from "../../assets/shaders/basicTexture.frag";
import * as vertSrc from "../../assets/shaders/mvpUV.vert";

import * as crateDiffuse from "../../assets/img/crate.png";

import * as Model from "../model.js";
import * as glm from "../gl-matrix.js";

const mat4 = glm.mat4;
const vec3 = glm.vec3;

import cubeModel from "../../assets/objects/cube.obj";

export default class Test {

  constructor() {}

  async init(gl, pos) {
    this.pos = pos;
    this.diffuseImg = await Util.loadImage(crateDiffuse);

    // Only need to create these matrices once
    this.modelMatrix = mat4.create();
    this.projectionMatrix = mat4.create();
    // This is currently constant
    mat4.perspective(
      this.projectionMatrix, // Destination matrix
      45 * Math.PI / 180, // FOV
      16/9, // Aspect ratio
      0.1, // Near clipping plane
      100.0, // Far clipping plane
    );

    // Create program and link shaders
    this.programInfo = Util.createProgram(gl, {vertex: vertSrc, fragment: fragSrc}, {
      uniform: {
        diffuse: 'diffuse',
        modelMatrix: 'model',
        viewMatrix: 'view',
        projectionMatrix : 'projection',
      },
      attribute: {
        vertex: 'vertex',
        uv: 'vertex_uv',
      },
    });

    this.indices = cubeModel.indices;
    this.vertexData = new Float32Array(Model.fromObj(cubeModel));

    this.elementBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.elementBuffer);
    // NOTE In the future Uint8 might not be large enough
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(this.indices), gl.STATIC_DRAW);

    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertexData, gl.STATIC_DRAW);

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
    const o = new Test();
    await o.init(gl, pos);
    return o;
  }

  draw(canvas, gl, camera) {
    gl.useProgram(this.programInfo.program);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.diffuse);
    gl.uniform1i(this.programInfo.locations.uniform.diffuse, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);

    gl.enableVertexAttribArray(this.programInfo.locations.attribute.vertex);
    gl.vertexAttribPointer(this.programInfo.locations.attribute.vertex, 3, gl.FLOAT, false, 5*4, 0);

    gl.enableVertexAttribArray(this.programInfo.locations.attribute.uv);
    gl.vertexAttribPointer(this.programInfo.locations.attribute.uv, 2, gl.FLOAT, true, 5*4, 3*4);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.elementBuffer);

    const viewMatrix = camera;

    mat4.fromTranslation(
      this.modelMatrix,
      this.pos
    );

    gl.uniformMatrix4fv(
      this.programInfo.locations.uniform.projectionMatrix,
      false,
      this.projectionMatrix);

    gl.uniformMatrix4fv(
      this.programInfo.locations.uniform.viewMatrix,
      false,
      viewMatrix);

    gl.uniformMatrix4fv(
      this.programInfo.locations.uniform.modelMatrix,
      false,
      this.modelMatrix);

    gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_BYTE, 0);
    gl.disableVertexAttribArray(this.programInfo.locations.attribute.vertex);
  }
 
}

