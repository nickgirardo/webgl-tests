
/*
 * @function build
 *
 * @param Array(Float) verts Input verticies, can be Typed Array
 * @param Function comparator Predicate function testing for equality
 * @param Boolean flatten (default true) should the resulting vertex array be flattened?
 *
 * @returns {indicies: Array(Int), verticies: Array(Array(Float))|Float32Array}
 *
 */
export function build(verts, comparator, flatten=true) {
  const indicies = [];
  const verticies = [];

  verts.forEach(v=> {
    // TODO this is awful
    const reducer = (acc, val, ix) => {
      if(acc !== -1) return acc;
      if(comparator(v,val)) return ix;
      return -1;
    };
    const match = verticies.reduce(reducer, -1);
    if(match !== -1) {
      indicies.push(match);
    } else {
      indicies.push(verticies.length);
      verticies.push(v);
    }
  });

  if(!flatten)
    return { indicies, verticies }

  // Flatten verticies to single Float32Array
  const elementsEach = verticies[0].length;
  const vertBuffer = new Float32Array(verticies.length * elementsEach);
  verticies.forEach((v,ix) => vertBuffer.set(v, ix * elementsEach));

  return { indicies, verticies: vertBuffer };

}
