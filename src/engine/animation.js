

export class Animation {

  constructor(keyFrames, length) {
    this.keyFrames = keyFrames;
    this.length = length;
  }
}

export class Keyframe {

  // For testing, a Keyframe only holds a simple rotation parameter
  // In the future this should hold all of the transforms for each
  // joint in a model
  constructor(timeStamp, rotation) {
    this.timeStamp = timeStamp;
    this.rotation = rotation;
  }
}
