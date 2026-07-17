/**
 * Soft ROI: boost centre luminance contrast for mapping priority.
 * Does not change grid resolution (still one grid) — biases detail toward centre.
 */
export function applyRoiBias(
  luminance: Float32Array,
  width: number,
  height: number,
  radiusFraction: number,
  enabled: boolean,
): Float32Array {
  if (!enabled) return luminance;
  const out = new Float32Array(luminance);
  const cx = (width - 1) / 2;
  const cy = (height - 1) / 2;
  const r = Math.max(2, Math.min(width, height) * Math.max(0.15, Math.min(0.85, radiusFraction)));
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = y * width + x;
      const d = Math.hypot(x - cx, y - cy) / r;
      if (d < 1) {
        // Slight local contrast in ROI
        const v = out[i]!;
        out[i] = Math.max(0, Math.min(1, (v - 0.5) * 1.12 + 0.5));
      } else {
        // Soft periphery toward mid — fewer glyph flips
        const t = Math.min(1, (d - 1) * 0.8);
        out[i] = out[i]! * (1 - t * 0.25) + 0.5 * (t * 0.25);
      }
    }
  }
  return out;
}
