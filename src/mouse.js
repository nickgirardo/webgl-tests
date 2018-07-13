
// These store the total amount that the mouse has moved since the last update (every frame)
export let movementX = 0;
export let movementY = 0;

export function update() {
  // Clear movement trackers
  movementX = 0;
  movementY = 0;
}

export function init(canvas) {
  canvas.addEventListener("click", lockCanvas);

  function lockCanvas() {
    canvas.requestPointerLock();
  }

  function handleMovement(e) {
    console.log(e.movementX, e.movementY);
    movementX += e.movementX;
    movementY += e.movementY;
  };

  document.addEventListener("pointerlockchange", () => {
    if(document.pointerLockElement === canvas) {
      canvas.addEventListener("mousemove", handleMovement);
      canvas.removeEventListener("click", lockCanvas);
    } else {
      canvas.removeEventListener("mousemove", handleMovement);
      canvas.addEventListener("click", lockCanvas);
    }
  });
}

