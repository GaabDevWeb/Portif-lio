/** Decide whether a near-duplicate frame can be skipped (adaptive FPS). */
export function shouldSkipFrame(
  motionFraction: number,
  similarityThreshold: number,
  enabled: boolean,
): boolean {
  if (!enabled) return false;
  return motionFraction <= similarityThreshold;
}
