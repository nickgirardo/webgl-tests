
/*
 * @function loadImage
 *
 * @param string src Source of image to be loaded
 *
 * @returns Promise(Image) Promise completed when image element loaded
 *
 */
export function loadImage(src) {
	return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onerror = function(error) {
      reject(error);
    }
    img.onload = function() {
      resolve(img);
    };
  })
};

/*
 * @function createShader
 *
 * @param WebGL2RenderingContext gl
 * @param WebGLProgram program
 * @param string src Raw source of shader
 * @param GLenum type Must be either gl.FRAGMENT_SHADER or gl.VERTEX_SHADER
 *
 * Impure, modifies program argument by attaching to it compiled shader
 *
 */
export function createShader(gl, program, src, type) {
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

/*
 * @function createProgram
 *
 * @param WebGL2RenderingContext gl
 * @param {vertex: string, fragment:string} shaders Raw sources of shaders
 * @param Object names
 *
 * @returns {program: WebGLProgram, locations: Object}
 */
export function createProgram(gl, shaders, names) {
  const program = gl.createProgram();

  createShader(gl, program, shaders.vertex, gl.VERTEX_SHADER);
  createShader(gl, program, shaders.fragment, gl.FRAGMENT_SHADER);

  gl.linkProgram(program);
  const linkLog = gl.getProgramInfoLog(program);
  if(linkLog)
    console.error(linkLog);

  //Get locations of program's uniforms and attributes by name
  const locations = getLocations(gl, program, names.uniform, names.attribute);

  return {program, locations};
}

/*
 * @function getLocations
 *
 * @param WebGL2RenderingContext gl
 * @param WebGLProgram program
 * @param Object uniformNames Key represents where location will be stored in result, value is the name of the uniform in shader program
 * @param Object attribNames Key represents where location will be stored in result, value is the name of the attribute in shader program
 */
export function getLocations(gl, program, uniformNames, attribNames) {
  const uniformKV = Object.entries(uniformNames);
  let uniform = {}
  uniformKV.forEach(([k, v]) => {
    uniform[k] = gl.getUniformLocation(program, v)
  });

  const attribKV = Object.entries(attribNames);
  let attribute = {}
  attribKV.forEach(([k, v]) => {
    attribute[k] = gl.getAttribLocation(program, v)
  });

  return {uniform, attribute};
}


