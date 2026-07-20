/**
 * Character weight map — maps glyphs to visual density (0…100).
 * Used to build ordered charsets and luminance LUTs.
 */

import { mapLuminanceToCharByDensity } from "@/features/ascii-interaction/image-pipeline/charset-mapper";

export type CharWeightMap = Record<string, number>;

/** Default ink weights for common glyphs (0 empty → 100 solid). */
export const DEFAULT_CHAR_WEIGHTS: CharWeightMap = {
  " ": 0,
  ".": 10,
  ":": 15,
  "-": 20,
  "=": 30,
  "+": 40,
  "*": 55,
  "#": 70,
  "%": 85,
  "@": 100,
  "░": 40,
  "▒": 60,
  "▓": 80,
  "█": 100,
  "0": 35,
  "1": 55,
};

export function weightForChar(ch: string, weights: CharWeightMap = DEFAULT_CHAR_WEIGHTS): number {
  if (weights[ch] != null) return Math.max(0, Math.min(100, weights[ch]!));
  // Fallback: approximate from built-in density table via position heuristics
  if (ch.trim() === "") return 0;
  return 50;
}

/** Sort unique charset chars by ascending weight (light → dark). */
export function orderCharsetByWeight(
  charset: string,
  weights: CharWeightMap = DEFAULT_CHAR_WEIGHTS,
): string {
  const unique = [...new Set(charset.split(""))];
  unique.sort((a, b) => weightForChar(a, weights) - weightForChar(b, weights));
  return unique.join("");
}

/**
 * Build 256-entry LUT: luminance byte → char index into ordered charset.
 * Higher weight glyphs map to higher luminance (or invert if needed by caller).
 */
export function buildWeightLut(
  orderedCharset: string,
  weights: CharWeightMap = DEFAULT_CHAR_WEIGHTS,
): Uint8Array {
  const n = Math.max(1, orderedCharset.length);
  const lut = new Uint8Array(256);
  const centers = [...orderedCharset].map((ch, i) => {
    const w = weightForChar(ch, weights) / 100;
    return { i, w };
  });
  for (let L = 0; L < 256; L += 1) {
    const t = L / 255;
    let best = 0;
    let bestD = Infinity;
    for (const c of centers) {
      const d = Math.abs(c.w - t);
      if (d < bestD) {
        bestD = d;
        best = c.i;
      }
    }
    lut[L] = best;
  }
  // Ensure coverage uses full range when weights cluster
  if (n > 1) {
    for (let L = 0; L < 256; L += 1) {
      const idx = Math.round((L / 255) * (n - 1));
      // Blend positional mapping with weight centers (prefer weights when spread)
      const spread =
        weightForChar(orderedCharset[n - 1]!, weights) -
        weightForChar(orderedCharset[0]!, weights);
      if (spread < 20) lut[L] = idx;
    }
  }
  return lut;
}

export function applyWeightsToCharset(
  charset: string,
  weights: CharWeightMap,
): string {
  const ordered = orderCharsetByWeight(charset.length > 0 ? charset : " .", weights);
  return ordered.length > 1 ? ordered : " .";
}

/** Pick char for luminance 0…1 using weight-ordered charset. */
export function mapLuminanceWithWeights(
  luminance: number,
  charset: string,
  weights: CharWeightMap,
): { char: string; index: number } {
  const ordered = applyWeightsToCharset(charset, weights);
  return mapLuminanceToCharByDensity(luminance, ordered);
}
