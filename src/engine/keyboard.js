
export let keys = [];
export let timestamps = [];
export let timestampsUp = [];
export let lastKey = {};

export function init() {
  document.addEventListener("keydown", keydown);
  document.addEventListener("keyup", keyup);
}

function keydown(e) {
  const key = e.keyCode;

  if(keys[key]) return;

  keys[key] = true;
  timestamps[key] = Date.now();
  lastKey = {e, key};
}

function keyup(e) {
  const key = e.keyCode;

  if(!keys[key]) return;

  keys[key] = false;
  timestampsUp[key] = Date.now();
}
