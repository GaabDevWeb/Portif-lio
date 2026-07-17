import type { ImagePipelineOptions, ImageSampleBuffer } from "@/features/ascii-interaction/image-pipeline/types";
import {
  resolveGridSize,
  resolveMetricsFromOptions,
} from "@/features/ascii-interaction/geometry/aspect-ratio-engine";

function srgbToLinear(c: number): number {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

function linearLuminance(r: number, g: number, b: number): number {
  const R = srgbToLinear(r);
  const G = srgbToLinear(g);
  const B = srgbToLinear(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

/**
 * Area-average (box) downsample — preferred for ASCII fidelity.
 * Upsample falls back to bilinear-ish nearest blend.
 */
export function resampleRgba(
  pixels: Uint8ClampedArray,
  srcWidth: number,
  srcHeight: number,
  outWidth: number,
  outHeight: number,
): ImageSampleBuffer {
  const luminance = new Float32Array(outWidth * outHeight);
  const r = new Uint8ClampedArray(outWidth * outHeight);
  const g = new Uint8ClampedArray(outWidth * outHeight);
  const b = new Uint8ClampedArray(outWidth * outHeight);

  const scaleX = srcWidth / outWidth;
  const scaleY = srcHeight / outHeight;
  const downscaling = scaleX >= 1 && scaleY >= 1;

  for (let y = 0; y < outHeight; y += 1) {
    for (let x = 0; x < outWidth; x += 1) {
      const oi = y * outWidth + x;
      if (downscaling) {
        const x0 = Math.floor(x * scaleX);
        const y0 = Math.floor(y * scaleY);
        const x1 = Math.min(srcWidth, Math.ceil((x + 1) * scaleX));
        const y1 = Math.min(srcHeight, Math.ceil((y + 1) * scaleY));
        let sumR = 0;
        let sumG = 0;
        let sumB = 0;
        let count = 0;
        for (let sy = y0; sy < y1; sy += 1) {
          for (let sx = x0; sx < x1; sx += 1) {
            const si = (sy * srcWidth + sx) * 4;
            sumR += pixels[si]!;
            sumG += pixels[si + 1]!;
            sumB += pixels[si + 2]!;
            count += 1;
          }
        }
        if (count === 0) count = 1;
        const pr = Math.round(sumR / count);
        const pg = Math.round(sumG / count);
        const pb = Math.round(sumB / count);
        r[oi] = pr;
        g[oi] = pg;
        b[oi] = pb;
        luminance[oi] = linearLuminance(pr, pg, pb);
      } else {
        const sx = Math.min(srcWidth - 1, Math.floor(x * scaleX));
        const sy = Math.min(srcHeight - 1, Math.floor(y * scaleY));
        const si = (sy * srcWidth + sx) * 4;
        const pr = pixels[si]!;
        const pg = pixels[si + 1]!;
        const pb = pixels[si + 2]!;
        r[oi] = pr;
        g[oi] = pg;
        b[oi] = pb;
        luminance[oi] = linearLuminance(pr, pg, pb);
      }
    }
  }

  return { width: outWidth, height: outHeight, luminance, r, g, b };
}

/** @deprecated use resampleRgba — kept as alias for callers. */
export function sampleRgba(
  pixels: Uint8ClampedArray,
  srcWidth: number,
  srcHeight: number,
  outWidth: number,
  outHeight: number,
): ImageSampleBuffer {
  return resampleRgba(pixels, srcWidth, srcHeight, outWidth, outHeight);
}

export { applyImageFilters } from "@/features/ascii-interaction/image-pipeline/image-processor";

export function resolveOutputSizeFromDimensions(
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

export function runRgbaPipeline(
  pixels: Uint8ClampedArray,
  srcWidth: number,
  srcHeight: number,
  options: ImagePipelineOptions,
): ImageSampleBuffer {
  const { width, height } = resolveOutputSizeFromDimensions(srcWidth, srcHeight, options);
  return resampleRgba(pixels, srcWidth, srcHeight, width, height);
}
