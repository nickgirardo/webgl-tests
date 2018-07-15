
/*
 * @function build
 *
 * @param Array(Float) verts Input vertices, can be Typed Array
 * @param Function comparator Predicate function testing for equality
 * @param Boolean flatten (default true) should the resulting vertex array be flattened?
 *
 * @returns {indicies: Array(Int), vertices: Array(Array(Float))|Float32Array}
 *
 */
export function build(verts, comparator, flatten=true) {
  const indicies = [];
  const vertices = [];

  verts.forEach(v=> {
    // TODO this is awful
    const reducer = (acc, val, ix) => {
      if(acc !== -1) return acc;
      if(comparator(v,val)) return ix;
      return -1;
    };
    const match = vertices.reduce(reducer, -1);
    if(match !== -1) {
      indicies.push(match);
    } else {
      indicies.push(vertices.length);
      vertices.push(v);
    }
  });

  if(!flatten)
    return { indicies, vertices }

  // Flatten vertices to single Float32Array
  const elementsEach = vertices[0].length;
  const vertBuffer = new Float32Array(vertices.length * elementsEach);
  vertices.forEach((v,ix) => vertBuffer.set(v, ix * elementsEach));

  return { indicies, vertices: vertBuffer };

}
