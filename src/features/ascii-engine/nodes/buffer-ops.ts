import type { ImageSampleBuffer } from "@/features/ascii-interaction/image-pipeline/types";
import { applyImageFilters } from "@/features/ascii-interaction/image-pipeline/image-processor";
import { sampleRgba } from "@/features/ascii-interaction/image-pipeline/rgba-processor";
import type { RgbaFrame } from "@/features/ascii-interaction/animation-pipeline/types";

function cloneBuffer(buffer: ImageSampleBuffer): ImageSampleBuffer {
  return {
    width: buffer.width,
    height: buffer.height,
    luminance: new Float32Array(buffer.luminance),
    r: new Uint8ClampedArray(buffer.r),
    g: new Uint8ClampedArray(buffer.g),
    b: new Uint8ClampedArray(buffer.b),
  };
}

const FILTER_NEUTRAL: {
  brightness: number;
  contrast: number;
  gamma: number;
  exposure: number;
  sharpness: number;
  invert: boolean;
  invertLuminance: boolean;
  invertColors: boolean;
  threshold: number;
  blur: number;
  edgeEnhance: number;
  blackPoint: number;
  midPoint: number;
  whitePoint: number;
} = {
  brightness: 0,
  contrast: 1,
  gamma: 1,
  exposure: 0,
  sharpness: 0,
  invert: false,
  invertLuminance: false,
  invertColors: false,
  threshold: 0,
  blur: 0,
  edgeEnhance: 0,
  blackPoint: 0,
  midPoint: 0.5,
  whitePoint: 1,
};

/** Aplica um único filtro do image-pipeline sobre ImageBuffer. */
export function applySingleFilter(
  buffer: ImageSampleBuffer,
  patch: Partial<typeof FILTER_NEUTRAL>,
): ImageSampleBuffer {
  return applyImageFilters(cloneBuffer(buffer), { ...FILTER_NEUTRAL, ...patch });
}

/** Resize via sampleRgba (nearest) — worker-safe, sem DOM. */
export function resizeImageBuffer(
  buffer: ImageSampleBuffer,
  outWidth: number,
  outHeight: number,
): ImageSampleBuffer {
  const w = Math.max(1, Math.round(outWidth));
  const h = Math.max(1, Math.round(outHeight));
  if (w === buffer.width && h === buffer.height) return cloneBuffer(buffer);

  const pixels = new Uint8ClampedArray(buffer.width * buffer.height * 4);
  for (let i = 0; i < buffer.width * buffer.height; i += 1) {
    const o = i * 4;
    pixels[o] = buffer.r[i]!;
    pixels[o + 1] = buffer.g[i]!;
    pixels[o + 2] = buffer.b[i]!;
    pixels[o + 3] = 255;
  }
  return sampleRgba(pixels, buffer.width, buffer.height, w, h);
}

/** Converte RgbaFrame → ImageBuffer (amostra 1:1). */
export function rgbaFrameToImageBuffer(frame: Pick<RgbaFrame, "pixels" | "width" | "height">): ImageSampleBuffer {
  return sampleRgba(frame.pixels, frame.width, frame.height, frame.width, frame.height);
}

export function requireImageBuffer(
  value: unknown,
  nodeId: string,
  port = "image",
): ImageSampleBuffer {
  if (
    value &&
    typeof value === "object" &&
    "luminance" in value &&
    "width" in value &&
    "height" in value
  ) {
    return value as ImageSampleBuffer;
  }
  throw new Error(`Node ${nodeId}: porta "${port}" espera ImageBuffer`);
}

export function asNumber(params: Record<string, unknown>, key: string, fallback: number): number {
  const v = params[key];
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

export function asBoolean(params: Record<string, unknown>, key: string, fallback: boolean): boolean {
  const v = params[key];
  return typeof v === "boolean" ? v : fallback;
}

export function asString(params: Record<string, unknown>, key: string, fallback: string): string {
  const v = params[key];
  return typeof v === "string" ? v : fallback;
}
