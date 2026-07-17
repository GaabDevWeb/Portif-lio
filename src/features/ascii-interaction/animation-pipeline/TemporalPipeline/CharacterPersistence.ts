import { mapLuminanceToCharIndex } from "@/features/ascii-interaction/image-pipeline/charset-mapper";

/**
 * Hysteresis on glyph index: keep previous char while luminance stays in band.
 */
export function applyCharacterPersistence(
  luminance: Float32Array,
  charsetLength: number,
  prevIndex: Int16Array | null,
  band: number,
): { indices: Int16Array; changed: number } {
  const n = luminance.length;
  const indices = new Int16Array(n);
  let changed = 0;
  const half = Math.max(0, band);

  for (let i = 0; i < n; i += 1) {
    const lum = luminance[i]!;
    const fresh = mapLuminanceToCharIndex(lum, charsetLength);
    if (!prevIndex || prevIndex[i]! < 0) {
      indices[i] = fresh;
      changed += 1;
      continue;
    }
    const prev = prevIndex[i]!;
    const prevCenter = charsetLength <= 1 ? 0 : prev / (charsetLength - 1);
    if (Math.abs(lum - prevCenter) <= half) {
      indices[i] = prev;
    } else {
      indices[i] = fresh;
      if (fresh !== prev) changed += 1;
    }
  }
  return { indices, changed };
}
