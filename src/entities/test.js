import * as Util from "../engine/util.js";

import * as fragSrc from "../../assets/shaders/screenSpace.frag";
import * as vertSrc from "../../assets/shaders/mvp.vert";

import * as lenna from "../../assets/img/lenna.png";

import * as Model from "../engine/model.js";
import { vec3, mat4 } from "../engine/gl-matrix.js";

export default class Test {

  constructor() {}

  async init(gl, pos) {
    this.pos = pos;
    this.diffuseImg = await Util.loadImage(lenna);

    // Only need to create these matrices once
    this.modelMatrix = mat4.create();

    // Create program and link shaders
    this.programInfo = Util.createProgram(gl, {vertex: vertSrc, fragment: fragSrc}, {
      uniform: {
        diffuse: 'diffuse',
        imageSize: 'imageSize',
        modelMatrix: 'model',
        viewProjMatrix: 'viewProj',
      },
      attribute: {
        position: 'position',
      },
    });

    const positions = [
      [ -0.5, -0.8, 0.0, ],
      [ -0.5, 0.5, 0.0, ],
      [ 0.5, 0.5, 0.0, ],
      [ 0.5, 0.5, 0.0, ],
      [ 0.5, -0.8, 0.0, ],
      [ -0.5, -0.8, 0.0, ],
    ].map(v => vec3.fromValues(...v));

    const {indices, vertices} = Model.build(positions, vec3.equals);

    this.indices = indices;
    this.vertices = vertices;

    this.elementBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.elementBuffer);
    // NOTE In the future Uint8 might not be large enough
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(this.indices), gl.STATIC_DRAW);

    this.positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);

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

    gl.uniform2f(this.programInfo.locations.uniform.imageSize, canvas.width / 3, canvas.height / 3);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.diffuse);
    gl.uniform1i(this.programInfo.locations.uniform.diffuse, 0);

    gl.enableVertexAttribArray(this.programInfo.locations.attribute.position);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.vertexAttribPointer(this.programInfo.locations.attribute.position, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.elementBuffer);

    mat4.fromTranslation(
      this.modelMatrix,
      this.pos
    );

    gl.uniformMatrix4fv(
      this.programInfo.locations.uniform.viewProjMatrix,
      false,
      camera.viewProjMatrix);

    gl.uniformMatrix4fv(
      this.programInfo.locations.uniform.modelMatrix,
      false,
      this.modelMatrix);

    gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_BYTE, 0);
    gl.disableVertexAttribArray(this.programInfo.locations.attribute.position);
  }

  update() {}
 
}
