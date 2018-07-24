
import { mat4, quat } from "./gl-matrix.js";

export default class Animator {

  constructor(model) {
    this.model = model;
    this.currAnim = null;
    this.currTime = null;
  }

  animate(animation, ts=0) {
    this.currAnim = animation;
    this.currTime = ts;
  }

  update() {
    const advanceTime = () => {
      // TODO should this be in frames or seconds?
      this.currTime += 1;
      // Loop anim
      if(this.currTime > this.currAnim.length)
        this.currTime %= this.currAnim.length;
    }
    const calculatePose = () => {
      // Get previous and next frames of animation
      const getFrames = () => {
        const frames = this.currAnim.keyFrames;

        let i;
        for(i = 1; i < frames.length; i++) {
          if(frames[i].timeStamp > this.currTime)
            break;
        }

        i %= frames.length;
        const prev = frames[i===0 ? frames.length-1 : i-1]; 
        const next = frames[i];
        return [prev, next];
      }
      // Get the amount elapsed between keyframes, range 0-1
      const getProgress = (prev, next)  => {
        const nextTime = next.timeStamp === 0 ? this.currAnim.length : next.timeStamp;
        const totalTime = nextTime - prev.timeStamp;
        const passedTime = nextTime - this.currTime;
        return 1 - (passedTime / totalTime);
      }
      const [prevFrame, nextFrame] = getFrames();
      const progress = getProgress(prevFrame, nextFrame);

      const temp = quat.create();
      quat.slerp(temp, prevFrame.rotation, nextFrame.rotation, progress);
      return temp;
    }
    // TODO this is basically a test now
    // Pose is just a rot quat but should also hold translation info
    const applyPose = (pose) => {
      mat4.fromQuat(this.model.transformMatrix, pose);
    }

    if(!this.currAnim) return;
    
    advanceTime();
    const pose = calculatePose();
    applyPose(pose);

  }
}
