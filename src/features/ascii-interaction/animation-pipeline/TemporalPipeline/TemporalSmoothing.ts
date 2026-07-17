/**
 * Temporal blend across N-1 / N / N+1 luminance fields.
 * With only previous: classic EMA. With next: symmetric 3-tap.
 */
export function smoothTemporal(
  current: Float32Array,
  previous: Float32Array | null,
  strength: number,
  next: Float32Array | null = null,
): Float32Array {
  if (strength <= 0) return new Float32Array(current);
  const a = Math.max(0, Math.min(1, strength));
  const hasPrev = previous != null && previous.length === current.length;
  const hasNext = next != null && next.length === current.length;
  if (!hasPrev && !hasNext) return new Float32Array(current);

  const out = new Float32Array(current.length);
  for (let i = 0; i < current.length; i += 1) {
    const c = current[i]!;
    if (hasPrev && hasNext) {
      const side = a * 0.5;
      out[i] = previous![i]! * side + c * (1 - a) + next![i]! * side;
    } else if (hasPrev) {
      out[i] = previous![i]! * a + c * (1 - a);
    } else {
      out[i] = next![i]! * a + c * (1 - a);
    }
  }
  return out;
}
