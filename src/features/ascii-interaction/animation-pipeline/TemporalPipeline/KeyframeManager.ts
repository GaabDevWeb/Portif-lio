/** Keyframe bookkeeping for future editor (diffs between keyframes). */
export function isKeyframe(
  frameIndex: number,
  lastKeyframe: number,
  interval: number,
  motionFraction: number,
  forceKeyMotion = 0.35,
): boolean {
  if (frameIndex === 0) return true;
  if (interval > 0 && frameIndex - lastKeyframe >= interval) return true;
  if (motionFraction >= forceKeyMotion) return true;
  return false;
}

export interface KeyframeRecord {
  index: number;
  motionFraction: number;
}

export class KeyframeManager {
  readonly records: KeyframeRecord[] = [];

  push(index: number, motionFraction: number): void {
    this.records.push({ index, motionFraction });
  }

  clear(): void {
    this.records.length = 0;
  }
}
