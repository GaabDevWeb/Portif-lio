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

const BAYER_2X2 = [
  0, 2,
  3, 1,
];

/**
 * @param levels — número de níveis do charset (= charset.length). Internamente usa levels-1 uma vez.
 */
export function applyDithering(
  luminance: Float32Array,
  width: number,
  height: number,
  mode: DitheringMode,
  levels: number,
): Float32Array {
  if (mode === "none") return luminance;
  if (levels < 2) return luminance;

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
    case "bayer-2x2":
      orderedBayerNxN(out, width, height, n, BAYER_2X2, 2);
      break;
    case "ordered":
    case "bayer":
    case "bayer-4x4":
      orderedBayerNxN(out, width, height, n, BAYER_4X4, 4);
      break;
    default:
      break;
  }

  return out;
}

function quantize(value: number, maxIndex: number): number {
  if (maxIndex <= 0) return 0;
  return Math.round(clamp01(value) * maxIndex) / maxIndex;
}

function distribute(
  data: Float32Array,
  width: number,
  height: number,
  x: number,
  y: number,
  error: number,
  pattern: [number, number, number][],
  divisor: number,
): void {
  for (const [dx, dy, weight] of pattern) {
    const nx = x + dx;
    const ny = y + dy;
    if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
    data[ny * width + nx] = clamp01(data[ny * width + nx]! + (error * weight) / divisor);
  }
}

/** Floyd–Steinberg with serpentine scan. */
function floydSteinberg(data: Float32Array, width: number, height: number, maxIndex: number): void {
  for (let y = 0; y < height; y += 1) {
    const leftToRight = y % 2 === 0;
    const xStart = leftToRight ? 0 : width - 1;
    const xEnd = leftToRight ? width : -1;
    const xStep = leftToRight ? 1 : -1;
    for (let x = xStart; x !== xEnd; x += xStep) {
      const i = y * width + x;
      const old = data[i]!;
      const neu = quantize(old, maxIndex);
      const err = old - neu;
      data[i] = neu;
      const ahead = leftToRight ? 1 : -1;
      if (x + ahead >= 0 && x + ahead < width) {
        data[i + ahead] = clamp01(data[i + ahead]! + err * (7 / 16));
      }
      if (y + 1 < height) {
        if (x - ahead >= 0 && x - ahead < width) {
          data[i + width - ahead] = clamp01(data[i + width - ahead]! + err * (3 / 16));
        }
        data[i + width] = clamp01(data[i + width]! + err * (5 / 16));
        if (x + ahead >= 0 && x + ahead < width) {
          data[i + width + ahead] = clamp01(data[i + width + ahead]! + err * (1 / 16));
        }
      }
    }
  }
}

function atkinson(data: Float32Array, width: number, height: number, maxIndex: number): void {
  // Atkinson distributes 6/8 of error (weights of 1, divisor 8)
  const pattern: [number, number, number][] = [
    [1, 0, 1], [2, 0, 1], [-1, 1, 1], [0, 1, 1], [1, 1, 1], [0, 2, 1],
  ];
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = y * width + x;
      const old = data[i]!;
      const neu = quantize(old, maxIndex);
      const err = old - neu;
      data[i] = neu;
      distribute(data, width, height, x, y, err, pattern, 8);
    }
  }
}

function burkes(data: Float32Array, width: number, height: number, maxIndex: number): void {
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = y * width + x;
      const old = data[i]!;
      const neu = quantize(old, maxIndex);
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

function sierra(data: Float32Array, width: number, height: number, maxIndex: number): void {
  const pattern: [number, number, number][] = [
    [1, 0, 5], [2, 0, 3],
    [-2, 1, 2], [-1, 1, 4], [0, 1, 5], [1, 1, 4], [2, 1, 2],
    [-1, 2, 2], [0, 2, 3], [1, 2, 2],
  ];
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = y * width + x;
      const old = data[i]!;
      const neu = quantize(old, maxIndex);
      const err = old - neu;
      data[i] = neu;
      distribute(data, width, height, x, y, err, pattern, 32);
    }
  }
}

function stucki(data: Float32Array, width: number, height: number, maxIndex: number): void {
  const pattern: [number, number, number][] = [
    [1, 0, 8], [2, 0, 4],
    [-2, 1, 2], [-1, 1, 4], [0, 1, 8], [1, 1, 4], [2, 1, 2],
    [-2, 2, 1], [-1, 2, 2], [0, 2, 4], [1, 2, 2], [2, 2, 1],
  ];
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = y * width + x;
      const old = data[i]!;
      const neu = quantize(old, maxIndex);
      const err = old - neu;
      data[i] = neu;
      distribute(data, width, height, x, y, err, pattern, 42);
    }
  }
}

function jarvis(data: Float32Array, width: number, height: number, maxIndex: number): void {
  const pattern: [number, number, number][] = [
    [1, 0, 7], [2, 0, 5],
    [-2, 1, 3], [-1, 1, 5], [0, 1, 7], [1, 1, 5], [2, 1, 3],
    [-2, 2, 1], [-1, 2, 3], [0, 2, 5], [1, 2, 3], [2, 2, 1],
  ];
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = y * width + x;
      const old = data[i]!;
      const neu = quantize(old, maxIndex);
      const err = old - neu;
      data[i] = neu;
      distribute(data, width, height, x, y, err, pattern, 48);
    }
  }
}

function orderedBayerNxN(
  data: Float32Array,
  width: number,
  height: number,
  maxIndex: number,
  matrix: number[],
  n: number,
): void {
  const denom = n * n;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = y * width + x;
      const threshold = (matrix[(y % n) * n + (x % n)]! + 0.5) / denom;
      const adjusted = data[i]! + (threshold - 0.5) / Math.max(1, maxIndex);
      data[i] = quantize(adjusted, maxIndex);
    }
  }
}
