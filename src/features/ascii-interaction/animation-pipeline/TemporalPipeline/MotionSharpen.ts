/** Sharpen only where motionMask is high. */
export function motionSharpen(
  luminance: Float32Array,
  width: number,
  height: number,
  motionMask: Float32Array,
  amount: number,
): Float32Array {
  if (amount <= 0) return luminance;
  const src = new Float32Array(luminance);
  const out = new Float32Array(luminance);
  const a = Math.max(0, Math.min(1, amount));
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const i = y * width + x;
      if (motionMask[i]! < 0.5) continue;
      const center = src[i]!;
      const lap =
        5 * center -
        src[i - 1]! -
        src[i + 1]! -
        src[i - width]! -
        src[i + width]!;
      out[i] = Math.max(0, Math.min(1, center + (lap - center) * a * 0.35));
    }
  }
  return out;
}
