import type { ImagePipelineOptions, ImageSampleBuffer } from "@/features/ascii-interaction/image-pipeline/types";

/** Amostra RGBA raw para buffer luminance — sem DOM (worker-safe). */
export function sampleRgba(
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

  const xRatio = srcWidth / outWidth;
  const yRatio = srcHeight / outHeight;

  for (let y = 0; y < outHeight; y += 1) {
    const sy = Math.min(srcHeight - 1, Math.floor(y * yRatio));
    for (let x = 0; x < outWidth; x += 1) {
      const sx = Math.min(srcWidth - 1, Math.floor(x * xRatio));
      const si = (sy * srcWidth + sx) * 4;
      const oi = y * outWidth + x;
      const pr = pixels[si]!;
      const pg = pixels[si + 1]!;
      const pb = pixels[si + 2]!;
      r[oi] = pr;
      g[oi] = pg;
      b[oi] = pb;
      luminance[oi] = (0.2126 * pr + 0.7152 * pg + 0.0722 * pb) / 255;
    }
  }

  return { width: outWidth, height: outHeight, luminance, r, g, b };
}

export { applyImageFilters } from "@/features/ascii-interaction/image-pipeline/image-processor";

export function resolveOutputSizeFromDimensions(
  imgWidth: number,
  imgHeight: number,
  options: Pick<ImagePipelineOptions, "width" | "height" | "lockAspectRatio" | "pixelAspect" | "fontCompensation">,
): { width: number; height: number } {
  const aspect = (imgWidth / imgHeight) * options.pixelAspect * options.fontCompensation;
  const outW = Math.max(8, Math.round(options.width));
  let outH = options.height > 0 ? Math.max(8, Math.round(options.height)) : 0;
  if (outH === 0 || options.lockAspectRatio) {
    outH = Math.max(8, Math.round(outW / aspect));
  }
  return { width: outW, height: outH };
}

export function runRgbaPipeline(
  pixels: Uint8ClampedArray,
  srcWidth: number,
  srcHeight: number,
  options: ImagePipelineOptions,
): ImageSampleBuffer {
  const { width, height } = resolveOutputSizeFromDimensions(srcWidth, srcHeight, options);
  return sampleRgba(pixels, srcWidth, srcHeight, width, height);
}
