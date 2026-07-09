import type { DitheringMode } from "@/features/ascii-interaction/image-pipeline/types";

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

const BAYER_4X4 = [
  0, 8, 2, 10,
  12, 4, 14, 6,
  3, 11, 1, 9,
  15, 7, 13, 5,
];

export function applyDithering(
  luminance: Float32Array,
  width: number,
  height: number,
  mode: DitheringMode,
  levels: number,
): Float32Array {
  if (mode === "none") return luminance;

  const out = new Float32Array(luminance);
  const n = levels - 1;

  switch (mode) {
    case "floyd-steinberg":
      floydSteinberg(out, width, height, n);
      break;
    case "atkinson":
      atkinson(out, width, height, n);
      break;
    case "jarvis":
      jarvis(out, width, height, n);
      break;
    case "burkes":
      burkes(out, width, height, n);
      break;
    case "sierra":
      sierra(out, width, height, n);
      break;
    case "stucki":
      stucki(out, width, height, n);
      break;
    case "ordered":
    case "bayer":
      orderedBayer(out, width, height, n);
      break;
    default:
      break;
  }

  return out;
}

function quantize(value: number, levels: number): number {
  return Math.round(clamp01(value) * levels) / levels;
}

function distribute(
  data: Float32Array,
  width: number,
  x: number,
  y: number,
  error: number,
  pattern: [number, number, number][],
): void {
  for (const [dx, dy, weight] of pattern) {
    const nx = x + dx;
    const ny = y + dy;
    if (nx < 0 || nx >= width || ny < 0 || ny >= data.length / width) continue;
    data[ny * width + nx] = clamp01(data[ny * width + nx]! + (error * weight) / 42);
  }
}

function floydSteinberg(data: Float32Array, width: number, height: number, levels: number): void {
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = y * width + x;
      const old = data[i]!;
      const neu = quantize(old, levels);
      const err = old - neu;
      data[i] = neu;
      if (x + 1 < width) data[i + 1] = clamp01(data[i + 1]! + err * (7 / 16));
      if (y + 1 < height) {
        if (x > 0) data[i + width - 1] = clamp01(data[i + width - 1]! + err * (3 / 16));
        data[i + width] = clamp01(data[i + width]! + err * (5 / 16));
        if (x + 1 < width) data[i + width + 1] = clamp01(data[i + width + 1]! + err * (1 / 16));
      }
    }
  }
}

function atkinson(data: Float32Array, width: number, height: number, levels: number): void {
  const pattern: [number, number, number][] = [
    [1, 0, 1], [2, 0, 1], [-1, 1, 1], [0, 1, 1], [1, 1, 1], [0, 2, 1],
  ];
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = y * width + x;
      const old = data[i]!;
      const neu = quantize(old, levels);
      const err = old - neu;
      data[i] = neu;
      distribute(data, width, x, y, err, pattern);
    }
  }
}

function burkes(data: Float32Array, width: number, height: number, levels: number): void {
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = y * width + x;
      const old = data[i]!;
      const neu = quantize(old, levels);
      const err = old - neu;
      data[i] = neu;
      const spread = [
        [1, 0, 8 / 32], [2, 0, 4 / 32],
        [-2, 1, 2 / 32], [-1, 1, 4 / 32], [0, 1, 8 / 32], [1, 1, 4 / 32], [2, 1, 2 / 32],
      ] as const;
      for (const [dx, dy, w] of spread) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || nx >= width || ny >= height) continue;
        data[ny * width + nx] = clamp01(data[ny * width + nx]! + err * w);
      }
    }
  }
}

function sierra(data: Float32Array, width: number, height: number, levels: number): void {
  const pattern: [number, number, number][] = [
    [1, 0, 5], [2, 0, 3],
    [-2, 1, 2], [-1, 1, 4], [0, 1, 5], [1, 1, 4], [2, 1, 2],
    [-1, 2, 2], [0, 2, 3], [1, 2, 2],
  ];
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = y * width + x;
      const old = data[i]!;
      const neu = quantize(old, levels);
      const err = old - neu;
      data[i] = neu;
      distribute(data, width, x, y, err, pattern);
    }
  }
}

function stucki(data: Float32Array, width: number, height: number, levels: number): void {
  const pattern: [number, number, number][] = [
    [1, 0, 8], [2, 0, 4],
    [-2, 1, 2], [-1, 1, 4], [0, 1, 8], [1, 1, 4], [2, 1, 2],
    [-2, 2, 1], [-1, 2, 2], [0, 2, 4], [1, 2, 2], [2, 2, 1],
  ];
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = y * width + x;
      const old = data[i]!;
      const neu = quantize(old, levels);
      const err = old - neu;
      data[i] = neu;
      distribute(data, width, x, y, err, pattern);
    }
  }
}

function jarvis(data: Float32Array, width: number, height: number, levels: number): void {
  const pattern: [number, number, number][] = [
    [1, 0, 7], [2, 0, 5],
    [-2, 1, 3], [-1, 1, 5], [0, 1, 7], [1, 1, 5], [2, 1, 3],
    [-2, 2, 1], [-1, 2, 3], [0, 2, 5], [1, 2, 3], [2, 2, 1],
  ];
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = y * width + x;
      const old = data[i]!;
      const neu = quantize(old, levels);
      const err = old - neu;
      data[i] = neu;
      distribute(data, width, x, y, err, pattern);
    }
  }
}

function orderedBayer(data: Float32Array, width: number, height: number, levels: number): void {
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = y * width + x;
      const threshold = (BAYER_4X4[(y % 4) * 4 + (x % 4)]! + 0.5) / 16;
      const adjusted = data[i]! + (threshold - 0.5) / levels;
      data[i] = quantize(adjusted, levels);
    }
  }
}
