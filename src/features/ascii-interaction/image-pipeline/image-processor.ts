import type { ImagePipelineOptions, ImageSampleBuffer } from "@/features/ascii-interaction/image-pipeline/types";
import { resampleRgba } from "@/features/ascii-interaction/image-pipeline/rgba-processor";
import {
  resolveGridSize,
  resolveMetricsFromOptions,
} from "@/features/ascii-interaction/geometry/aspect-ratio-engine";

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

/**
 * Resolve ASCII grid size from source image dims.
 * Uses glyph cell metrics (not legacy fontCompensation) so
 * (cols*cellW)/(rows*cellH) ≈ imgW/imgH.
 */
export function resolveOutputSize(
  imgWidth: number,
  imgHeight: number,
  options: Pick<
    ImagePipelineOptions,
    | "width"
    | "height"
    | "lockAspectRatio"
    | "pixelAspect"
    | "fontCompensation"
    | "glyphCellWidth"
    | "glyphCellHeight"
  >,
): { width: number; height: number } {
  const metrics = resolveMetricsFromOptions(options);
  const grid = resolveGridSize({
    imgWidth,
    imgHeight,
    cols: options.width,
    rows: options.height,
    lockAspectRatio: options.lockAspectRatio,
    pixelAspect: options.pixelAspect,
    metrics,
  });
  return { width: grid.cols, height: grid.rows };
}

/** Amostra imagem via area-average (mesma qualidade que o worker path). */
export function sampleImage(
  img: HTMLImageElement,
  outWidth: number,
  outHeight: number,
): ImageSampleBuffer {
  const srcW = Math.max(1, img.naturalWidth || img.width);
  const srcH = Math.max(1, img.naturalHeight || img.height);
  const canvas = document.createElement("canvas");
  canvas.width = srcW;
  canvas.height = srcH;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas 2D indisponível.");

  ctx.drawImage(img, 0, 0, srcW, srcH);
  const { data } = ctx.getImageData(0, 0, srcW, srcH);
  return resampleRgba(data, srcW, srcH, outWidth, outHeight);
}

export function applyImageFilters(
  buffer: ImageSampleBuffer,
  options: Pick<
    ImagePipelineOptions,
    | "brightness"
    | "contrast"
    | "gamma"
    | "exposure"
    | "sharpness"
    | "invert"
    | "threshold"
    | "blur"
    | "edgeEnhance"
  >,
): ImageSampleBuffer {
  const { width, height, luminance, r, g, b } = buffer;
  const outLum = new Float32Array(luminance);
  const outR = new Uint8ClampedArray(r);
  const outG = new Uint8ClampedArray(g);
  const outB = new Uint8ClampedArray(b);

  const gamma = Math.max(0.1, options.gamma);
  const contrast = options.contrast;
  const brightness = options.brightness;
  const exposure = Math.pow(2, options.exposure);

  for (let i = 0; i < outLum.length; i += 1) {
    let lum = outLum[i]! * exposure;
    lum = (lum - 0.5) * contrast + 0.5 + brightness * 0.5;
    lum = Math.pow(clamp01(lum), 1 / gamma);
    if (options.invert) lum = 1 - lum;
    if (options.threshold > 0) {
      lum = lum >= options.threshold ? 1 : 0;
    }
    outLum[i] = lum;

    let cr = (outR[i]! / 255) * exposure;
    let cg = (outG[i]! / 255) * exposure;
    let cb = (outB[i]! / 255) * exposure;
    cr = (cr - 0.5) * contrast + 0.5 + brightness * 0.5;
    cg = (cg - 0.5) * contrast + 0.5 + brightness * 0.5;
    cb = (cb - 0.5) * contrast + 0.5 + brightness * 0.5;
    cr = Math.pow(clamp01(cr), 1 / gamma);
    cg = Math.pow(clamp01(cg), 1 / gamma);
    cb = Math.pow(clamp01(cb), 1 / gamma);
    if (options.invert) {
      cr = 1 - cr;
      cg = 1 - cg;
      cb = 1 - cb;
    }
    outR[i] = Math.round(cr * 255);
    outG[i] = Math.round(cg * 255);
    outB[i] = Math.round(cb * 255);
  }

  if (options.blur > 0) {
    boxBlur(outLum, width, height, Math.ceil(options.blur * 2));
  }

  if (options.sharpness > 0) {
    sharpen(outLum, width, height, options.sharpness);
  }

  if (options.edgeEnhance > 0) {
    const edges = sobelEdges(outLum, width, height);
    for (let i = 0; i < outLum.length; i += 1) {
      outLum[i] = clamp01(outLum[i]! + edges[i]! * options.edgeEnhance);
    }
  }

  return { width, height, luminance: outLum, r: outR, g: outG, b: outB };
}

function boxBlur(data: Float32Array, w: number, h: number, radius: number): void {
  if (radius <= 0) return;
  const temp = new Float32Array(data);
  const size = radius * 2 + 1;

  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      let sum = 0;
      for (let ky = -radius; ky <= radius; ky += 1) {
        const sy = Math.min(h - 1, Math.max(0, y + ky));
        for (let kx = -radius; kx <= radius; kx += 1) {
          const sx = Math.min(w - 1, Math.max(0, x + kx));
          sum += temp[sy * w + sx]!;
        }
      }
      data[y * w + x] = sum / (size * size);
    }
  }
}

function sharpen(data: Float32Array, w: number, h: number, amount: number): void {
  const kernel = [0, -1, 0, -1, 5, -1, 0, -1, 0];
  convolve(data, w, h, kernel, amount);
}

export function sobelEdges(data: Float32Array, w: number, h: number): Float32Array {
  const gxK = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const gyK = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
  const gx = new Float32Array(data.length);
  const gy = new Float32Array(data.length);
  convolveInto(data, w, h, gxK, gx, 1);
  convolveInto(data, w, h, gyK, gy, 1);
  const out = new Float32Array(data.length);
  for (let i = 0; i < data.length; i += 1) {
    out[i] = clamp01(Math.hypot(gx[i]!, gy[i]!) * 2);
  }
  return out;
}

function convolve(data: Float32Array, w: number, h: number, kernel: number[], amount: number): void {
  const out = new Float32Array(data.length);
  convolveInto(data, w, h, kernel, out, 1);
  for (let i = 0; i < data.length; i += 1) {
    data[i] = clamp01(data[i]! + (out[i]! - data[i]!) * amount);
  }
}

function convolveInto(
  src: Float32Array,
  w: number,
  h: number,
  kernel: number[],
  dest: Float32Array,
  scale: number,
): void {
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      let sum = 0;
      let ki = 0;
      for (let ky = -1; ky <= 1; ky += 1) {
        const sy = Math.min(h - 1, Math.max(0, y + ky));
        for (let kx = -1; kx <= 1; kx += 1) {
          const sx = Math.min(w - 1, Math.max(0, x + kx));
          sum += src[sy * w + sx]! * kernel[ki]!;
          ki += 1;
        }
      }
      dest[y * w + x] = clamp01(sum * scale);
    }
  }
}
