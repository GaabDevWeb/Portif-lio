/**
 * Temporal dither: fixed Bayer threshold field (stable across static frames).
 * Moving cells can still receive per-frame ordered noise; static cells use locked pattern.
 */

const BAYER_4 = [
  0, 8, 2, 10,
  12, 4, 14, 6,
  3, 11, 1, 9,
  15, 7, 13, 5,
];

export function applyTemporalDither(
  luminance: Float32Array,
  width: number,
  height: number,
  motionMask: Float32Array | null,
  levels: number,
  enabled: boolean,
): Float32Array {
  if (!enabled || levels < 2) return luminance;
  const out = new Float32Array(luminance);
  const maxIndex = levels - 1;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = y * width + x;
      const moving = motionMask ? motionMask[i]! > 0.5 : true;
      // Static: locked Bayer. Moving: same Bayer (consistent) — avoids random snow.
      const threshold = (BAYER_4[(y % 4) * 4 + (x % 4)]! + 0.5) / 16;
      const strength = moving ? 1 : 0.65;
      const adjusted = out[i]! + ((threshold - 0.5) / Math.max(1, maxIndex)) * strength;
      const q = Math.round(Math.max(0, Math.min(1, adjusted)) * maxIndex) / maxIndex;
      out[i] = q;
    }
  }
  return out;
}
