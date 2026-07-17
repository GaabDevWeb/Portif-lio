/** Light box denoise — fights GIF palette noise without soft-blurring motion. */
export function reduceNoise(
  luminance: Float32Array,
  width: number,
  height: number,
  strength: number,
): Float32Array {
  if (strength <= 0) return luminance;
  const radius = strength >= 1.2 ? 2 : 1;
  const src = luminance;
  const out = new Float32Array(src.length);
  const w = Math.max(0, Math.min(1, strength));
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let sum = 0;
      let count = 0;
      for (let dy = -radius; dy <= radius; dy += 1) {
        const sy = Math.min(height - 1, Math.max(0, y + dy));
        for (let dx = -radius; dx <= radius; dx += 1) {
          const sx = Math.min(width - 1, Math.max(0, x + dx));
          sum += src[sy * width + sx]!;
          count += 1;
        }
      }
      const i = y * width + x;
      const blurred = sum / count;
      out[i] = src[i]! * (1 - w * 0.55) + blurred * (w * 0.55);
    }
  }
  return out;
}
