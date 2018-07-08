
export function loadImages(images) {
  return Promise.all(Object.entries(images).map(([name, url]) => loadImage(name, url)));
}

export function loadImage(name, url) {
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

export function createProgram(gl, shaders, names) {
  const program = gl.createProgram();

  createShader(gl, program, shaders.vertex, gl.VERTEX_SHADER);
  createShader(gl, program, shaders.fragment, gl.FRAGMENT_SHADER);

  gl.linkProgram(program);
  const linkLog = gl.getProgramInfoLog(program);
  if(linkLog)
    console.error(linkLog);

  //Get locations of program's uniforms and attributes by name
  const locations = getLocations(gl, program, names);

  return {program, locations};
}

export function getLocations(gl, program, names) {
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


