/**
 * Luminance histogram + auto-optimize for conversion refinement.
 */

import type { ImagePipelineOptions, ImageSampleBuffer } from "@/features/ascii-interaction/image-pipeline/types";

export interface LuminanceHistogram {
  bins: Uint32Array;
  binCount: number;
  min: number;
  max: number;
  mean: number;
  /** Approximate noise: mean absolute difference of neighbors (0…1). */
  noise: number;
}

export function computeLuminanceHistogram(
  buffer: Pick<ImageSampleBuffer, "luminance" | "width" | "height">,
  binCount = 64,
): LuminanceHistogram {
  const bins = new Uint32Array(binCount);
  let min = 1;
  let max = 0;
  let sum = 0;
  const { luminance, width, height } = buffer;
  for (let i = 0; i < luminance.length; i += 1) {
    const v = luminance[i]!;
    min = Math.min(min, v);
    max = Math.max(max, v);
    sum += v;
    const b = Math.min(binCount - 1, Math.floor(v * binCount));
    bins[b]! += 1;
  }
  let noiseAcc = 0;
  let noiseN = 0;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width - 1; x += 1) {
      const i = y * width + x;
      noiseAcc += Math.abs(luminance[i]! - luminance[i + 1]!);
      noiseN += 1;
    }
  }
  return {
    bins,
    binCount,
    min,
    max,
    mean: luminance.length ? sum / luminance.length : 0,
    noise: noiseN ? noiseAcc / noiseN : 0,
  };
}

/** Suggest pipeline tweaks from a sampled buffer (non-destructive starting point). */
export function autoOptimizeFromBuffer(
  buffer: ImageSampleBuffer,
  base: ImagePipelineOptions,
): Partial<ImagePipelineOptions> {
  const h = computeLuminanceHistogram(buffer);
  const patch: Partial<ImagePipelineOptions> = {};

  // Levels: pull black/white to 2%/98% of range present
  const span = Math.max(1e-3, h.max - h.min);
  patch.blackPoint = Math.max(0, h.min - span * 0.02);
  patch.whitePoint = Math.min(1, h.max + span * 0.02);
  patch.midPoint = h.mean < 0.35 ? 0.4 : h.mean > 0.65 ? 0.6 : 0.5;

  if (h.mean < 0.35) {
    patch.brightness = Math.min(0.35, (0.45 - h.mean) * 0.8);
    patch.gamma = Math.min(1.6, 1 + (0.45 - h.mean));
  } else if (h.mean > 0.65) {
    patch.brightness = Math.max(-0.35, (0.55 - h.mean) * 0.8);
    patch.gamma = Math.max(0.7, 1 - (h.mean - 0.55));
  }

  const dynamic = h.max - h.min;
  if (dynamic < 0.35) {
    patch.contrast = Math.min(2.2, 1.2 + (0.35 - dynamic) * 2);
  }

  if (h.noise < 0.04) {
    patch.sharpness = Math.min(0.55, 0.25 + (0.04 - h.noise) * 4);
    patch.edgeEnhance = Math.min(0.35, 0.1 + (0.04 - h.noise) * 2);
  } else if (h.noise > 0.12) {
    patch.blur = Math.min(1.2, (h.noise - 0.12) * 4);
    patch.dithering = "atkinson";
  }

  patch.adaptiveMapping = dynamic < 0.5;
  patch.characterDensity = dynamic < 0.4 ? 0.75 : 1;

  return { ...base, ...patch };
}
