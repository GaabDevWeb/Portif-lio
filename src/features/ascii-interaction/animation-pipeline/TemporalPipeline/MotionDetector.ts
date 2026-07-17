import type { MotionMap } from "@/features/ascii-interaction/animation-pipeline/TemporalPipeline/types";

/** Per-cell motion mask from absolute luminance delta. */
export function detectMotion(
  current: Float32Array,
  previous: Float32Array | null,
  width: number,
  height: number,
  threshold: number,
): MotionMap {
  const mask = new Float32Array(width * height);
  if (!previous || previous.length !== current.length) {
    mask.fill(1);
    return { width, height, mask, motionFraction: 1 };
  }
  let moving = 0;
  for (let i = 0; i < current.length; i += 1) {
    const d = Math.abs(current[i]! - previous[i]!);
    const m = d >= threshold ? 1 : 0;
    mask[i] = m;
    moving += m;
  }
  return {
    width,
    height,
    mask,
    motionFraction: current.length ? moving / current.length : 0,
  };
}
