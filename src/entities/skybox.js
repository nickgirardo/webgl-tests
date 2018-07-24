import * as Util from "../engine/util.js";

import * as fragSrc from "../../assets/shaders/cubemap.frag";
import * as vertSrc from "../../assets/shaders/skybox.vert";

import * as negXImg from "../../assets/img/skybox/negx.png";
import * as negYImg from "../../assets/img/skybox/negy.png";
import * as negZImg from "../../assets/img/skybox/negz.png";
import * as posXImg from "../../assets/img/skybox/posx.png";
import * as posYImg from "../../assets/img/skybox/posy.png";
import * as posZImg from "../../assets/img/skybox/posz.png";

import * as Model from "../engine/model.js";
import { vec3, mat4 } from "../engine/gl-matrix.js";

export default class Foo {

  constructor() {}

  async init(gl) {
    const [negX, negY, negZ, posX, posY, posZ] = await Promise.all(
        [negXImg, negYImg, negZImg, posXImg, posYImg, posZImg].map(Util.loadImage));

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
        cubemap: 'cubemap',
        viewMatrix: 'view',
        projectionMatrix : 'projection',
      },
      attribute: {
        position: 'position',
      },
    });

    // Skybox vertices
    const positions = [
      [-1.0,  1.0, -1.0],
      [-1.0, -1.0, -1.0],
      [1.0, -1.0, -1.0],
      [1.0, -1.0, -1.0],
      [1.0,  1.0, -1.0],
      [-1.0,  1.0, -1.0],

      [-1.0, -1.0,  1.0],
      [-1.0, -1.0, -1.0],
      [-1.0,  1.0, -1.0],
      [-1.0,  1.0, -1.0],
      [-1.0,  1.0,  1.0],
      [-1.0, -1.0,  1.0],

      [1.0, -1.0, -1.0],
      [1.0, -1.0,  1.0],
      [1.0,  1.0,  1.0],
      [1.0,  1.0,  1.0],
      [1.0,  1.0, -1.0],
      [1.0, -1.0, -1.0],

      [-1.0, -1.0,  1.0],
      [-1.0,  1.0,  1.0],
      [1.0,  1.0,  1.0],
      [1.0,  1.0,  1.0],
      [1.0, -1.0,  1.0],
      [-1.0, -1.0,  1.0],

      [-1.0,  1.0, -1.0],
      [1.0,  1.0, -1.0],
      [1.0,  1.0,  1.0],
      [1.0,  1.0,  1.0],
      [-1.0,  1.0,  1.0],
      [-1.0,  1.0, -1.0],

      [-1.0, -1.0, -1.0],
      [-1.0, -1.0,  1.0],
      [1.0, -1.0, -1.0],
      [1.0, -1.0, -1.0],
      [-1.0, -1.0,  1.0],
      [1.0, -1.0,  1.0],
    ];

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

    // -- Init Cubemap
    this.cubemap = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.cubemap);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, posX);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, negX);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, posY);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, negY);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, posZ);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, negZ);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  }

  // Janky hack because I want an asynchronous constructor
  static async create(gl) {
    const o = new Foo();
    await o.init(gl);
    return o;
  }

  draw(canvas, gl, camera) {
    gl.useProgram(this.programInfo.program);

    gl.uniform2f(this.programInfo.locations.uniform.imageSize, canvas.width / 16, canvas.height / 9);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.cubemap);
    gl.uniform1i(this.programInfo.locations.uniform.diffuse, 0);

    gl.enableVertexAttribArray(this.programInfo.locations.attribute.position);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.vertexAttribPointer(this.programInfo.locations.attribute.position, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.elementBuffer);

    const viewMatrix = camera;
    // These columns in the view matrix relate to the translation of the model
    // The skybox should remain fixed so these are zeroed
    viewMatrix[12] = 0;
    viewMatrix[13] = 0;
    viewMatrix[14] = 0;

    gl.uniformMatrix4fv(
      this.programInfo.locations.uniform.projectionMatrix,
      false,
      this.projectionMatrix);

    gl.uniformMatrix4fv(
      this.programInfo.locations.uniform.viewMatrix,
      false,
      viewMatrix);

    gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_BYTE, 0);
    gl.disableVertexAttribArray(this.programInfo.locations.attribute.position);
  }

}
