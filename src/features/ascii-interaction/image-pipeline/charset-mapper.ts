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

export function mapLuminanceToCharIndex(luminance: number, charsetLength: number): number {
  const clamped = Math.max(0, Math.min(1, luminance));
  return Math.min(charsetLength - 1, Math.round(clamped * (charsetLength - 1)));
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
  if (lum < 0.08) return { r: 0, g: 0, b: 0 };
  const gray = Math.round(lum * 23) + 232;
  if (gray <= 255) {
    const v = Math.round(((gray - 232) / 23) * 255);
    return { r: v, g: v, b: v };
  }
  return { r, g, b };
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
