import type { ColorMode } from "@/features/ascii-interaction/image-pipeline/types";

const ROOT_OS_PALETTE = [
  { r: 157, g: 255, b: 157 },
  { r: 61, g: 107, b: 61 },
  { r: 200, g: 255, b: 200 },
  { r: 10, g: 18, b: 10 },
  { r: 255, g: 200, b: 80 },
];

const ANSI_16: [number, number, number][] = [
  [0, 0, 0], [128, 0, 0], [0, 128, 0], [128, 128, 0],
  [0, 0, 128], [128, 0, 128], [0, 128, 128], [192, 192, 192],
  [128, 128, 128], [255, 0, 0], [0, 255, 0], [255, 255, 0],
  [0, 0, 255], [255, 0, 255], [0, 255, 255], [255, 255, 255],
];

/** Known ink coverage (0 = empty, 1 = solid) for common ASCII/block glyphs. */
const INK_TABLE: Record<string, number> = {
  " ": 0,
  ".": 0.05,
  ",": 0.06,
  "'": 0.04,
  "`": 0.04,
  ":": 0.1,
  ";": 0.12,
  "-": 0.08,
  "=": 0.18,
  "+": 0.22,
  "*": 0.35,
  "#": 0.55,
  "%": 0.5,
  "@": 0.7,
  "░": 0.25,
  "▒": 0.5,
  "▓": 0.75,
  "█": 1,
  "▁": 0.12,
  "▂": 0.25,
  "▃": 0.37,
  "▄": 0.5,
  "▅": 0.62,
  "▆": 0.75,
  "▇": 0.87,
  "⠀": 0,
  "⠁": 0.11,
  "⠃": 0.22,
  "⠇": 0.33,
  "⠏": 0.44,
  "⠟": 0.55,
  "⠿": 0.66,
  "⡿": 0.77,
  "⣿": 1,
};

const densityCache = new Map<string, Float32Array>();

function estimateInk(ch: string): number {
  if (Object.prototype.hasOwnProperty.call(INK_TABLE, ch)) return INK_TABLE[ch]!;
  if (ch === "\u2800") return 0;
  const cp = ch.codePointAt(0) ?? 32;
  // Braille block U+2800–U+28FF: count set dots
  if (cp >= 0x2800 && cp <= 0x28ff) {
    let bits = cp - 0x2800;
    let n = 0;
    while (bits) {
      n += bits & 1;
      bits >>= 1;
    }
    return n / 8;
  }
  // Block elements U+2580–U+259F — coarse
  if (cp >= 0x2580 && cp <= 0x259f) return 0.5;
  // Printable ASCII heuristic: denser glyphs tend to have more ink-like shapes
  if (cp >= 33 && cp <= 126) {
    const heavy = "#%@&WM8B$";
    const mid = "*+=oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|";
    if (heavy.includes(ch)) return 0.65 + heavy.indexOf(ch) * 0.03;
    if (mid.includes(ch)) return 0.25 + mid.indexOf(ch) * 0.01;
    return 0.12 + ((cp % 17) / 100);
  }
  return 0.4;
}

/**
 * Returns ink coverage [0..1] per charset index (same order as string).
 * Cached per charset string. Prefer measured table; canvas measure optional later.
 */
export function getCharsetInkCoverage(charset: string): Float32Array {
  const cached = densityCache.get(charset);
  if (cached) return cached;
  const coverage = new Float32Array(charset.length);
  for (let i = 0; i < charset.length; i += 1) {
    coverage[i] = estimateInk(charset[i]!);
  }
  densityCache.set(charset, coverage);
  return coverage;
}

/**
 * Map luminance (0=dark/empty intent depending on ramp) to charset index using
 * measured ink density: low luminance → low ink, high → high ink.
 */
export function mapLuminanceToCharIndex(luminance: number, charsetLength: number): number {
  const clamped = Math.max(0, Math.min(1, luminance));
  return Math.min(charsetLength - 1, Math.round(clamped * (charsetLength - 1)));
}

/**
 * Density-aware mapping: pick the glyph whose ink coverage is closest to luminance.
 * Falls back to linear index when charset length < 2.
 */
export function mapLuminanceToCharByDensity(
  luminance: number,
  charset: string,
): { index: number; char: string } {
  if (charset.length < 2) {
    return { index: 0, char: charset[0] ?? " " };
  }
  const coverage = getCharsetInkCoverage(charset);
  const target = Math.max(0, Math.min(1, luminance));
  let best = 0;
  let bestDist = Infinity;
  for (let i = 0; i < coverage.length; i += 1) {
    const d = Math.abs(coverage[i]! - target);
    if (d < bestDist) {
      bestDist = d;
      best = i;
    }
  }
  return { index: best, char: charset[best]! };
}

export function resolveCellColor(
  r: number,
  g: number,
  b: number,
  luminance: number,
  mode: ColorMode,
): { r: number; g: number; b: number } {
  switch (mode) {
    case "mono":
      return { r: luminance * 255, g: luminance * 255, b: luminance * 255 };
    case "color":
    case "truecolor":
      return { r, g, b };
    case "ansi16": {
      const idx = nearestPaletteIndex(r, g, b, ANSI_16);
      const [cr, cg, cb] = ANSI_16[idx]!;
      return { r: cr, g: cg, b: cb };
    }
    case "ansi256":
      return ansi256Color(luminance, r, g, b);
    case "gradient":
      return gradientColor(luminance);
    case "root-os": {
      const idx = nearestPaletteIndex(r, g, b, ROOT_OS_PALETTE.map((c) => [c.r, c.g, c.b] as [number, number, number]));
      const c = ROOT_OS_PALETTE[idx]!;
      return { r: c.r, g: c.g, b: c.b };
    }
    default:
      return { r, g, b };
  }
}

function nearestPaletteIndex(r: number, g: number, b: number, palette: [number, number, number][]): number {
  let best = 0;
  let bestDist = Infinity;
  for (let i = 0; i < palette.length; i += 1) {
    const [pr, pg, pb] = palette[i]!;
    const d = (r - pr) ** 2 + (g - pg) ** 2 + (b - pb) ** 2;
    if (d < bestDist) {
      bestDist = d;
      best = i;
    }
  }
  return best;
}

function ansi256Color(lum: number, r: number, g: number, b: number): { r: number; g: number; b: number } {
  // Prefer 6×6×6 color cube when chroma is meaningful; else greyscale ramp 232–255.
  const maxC = Math.max(r, g, b);
  const minC = Math.min(r, g, b);
  const chroma = maxC - minC;
  if (chroma < 18 && lum < 0.08) return { r: 0, g: 0, b: 0 };
  if (chroma < 18) {
    const grayIdx = Math.round(lum * 23);
    const v = Math.round((grayIdx / 23) * 255);
    return { r: v, g: v, b: v };
  }
  const to6 = (c: number) => Math.max(0, Math.min(5, Math.round((c / 255) * 5)));
  const ri = to6(r);
  const gi = to6(g);
  const bi = to6(b);
  const to8 = (i: number) => Math.round(i === 0 ? 0 : i === 5 ? 255 : 55 + i * 40);
  return { r: to8(ri), g: to8(gi), b: to8(bi) };
}

function gradientColor(lum: number): { r: number; g: number; b: number } {
  return {
    r: Math.round(20 + lum * 60),
    g: Math.round(80 + lum * 175),
    b: Math.round(120 + lum * 80),
  };
}

export const IMAGE_CHARSETS: Record<string, string> = {
  "ultra-light": " .,:;",
  classic: " .:-=+*#%@",
  dense: " ░▒▓█",
  blocks: " ▁▂▃▄▅▆▇█",
  braille: " ⠀⠁⠃⠇⠏⠟⠿⡿⣿",
  unicode: " .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$",
  custom: " .:-=+*#%@",
};
