import { describe, expect, it } from "vitest";

import { applyImageFilters } from "@/features/ascii-interaction/image-pipeline/image-processor";
import {
  applyAdaptiveLuminance,
  applyCharacterDensity,
} from "@/features/ascii-interaction/image-pipeline/matrix-generator";
import { DEFAULT_IMAGE_PIPELINE_OPTIONS } from "@/features/ascii-interaction/image-pipeline/types";
import type { ImageSampleBuffer } from "@/features/ascii-interaction/image-pipeline/types";

function makeBuffer(values: number[]): ImageSampleBuffer {
  const n = values.length;
  const luminance = new Float32Array(values);
  const r = new Uint8ClampedArray(n);
  const g = new Uint8ClampedArray(n);
  const b = new Uint8ClampedArray(n);
  for (let i = 0; i < n; i += 1) {
    const v = Math.round(values[i]! * 255);
    r[i] = v;
    g[i] = v;
    b[i] = v;
  }
  return { width: n, height: 1, luminance, r, g, b };
}

describe("refinement filters", () => {
  it("invertLuminance flips lum without requiring invertColors", () => {
    const buf = makeBuffer([0.2, 0.8]);
    const out = applyImageFilters(buf, {
      ...DEFAULT_IMAGE_PIPELINE_OPTIONS,
      invertLuminance: true,
      invertColors: false,
      invert: false,
    });
    expect(out.luminance[0]!).toBeCloseTo(0.8, 1);
    expect(out.luminance[1]!).toBeCloseTo(0.2, 1);
  });

  it("levels black/white stretch dynamic range", () => {
    const buf = makeBuffer([0.25, 0.5, 0.75]);
    const out = applyImageFilters(buf, {
      ...DEFAULT_IMAGE_PIPELINE_OPTIONS,
      blackPoint: 0.25,
      whitePoint: 0.75,
      midPoint: 0.5,
    });
    expect(out.luminance[0]!).toBeCloseTo(0, 1);
    expect(out.luminance[2]!).toBeCloseTo(1, 1);
  });

  it("character density sparsifies charset keeping endpoints", () => {
    const full = " .:-=+*#%@";
    const sparse = applyCharacterDensity(full, 0);
    expect(sparse.length).toBe(2);
    expect(sparse[0]).toBe(" ");
    expect(sparse[sparse.length - 1]).toBe("@");
  });

  it("adaptive luminance stretches percentiles", () => {
    const field = new Float32Array([0.4, 0.45, 0.5, 0.55, 0.6]);
    const out = applyAdaptiveLuminance(field);
    expect(Math.min(...out)).toBeLessThan(0.15);
    expect(Math.max(...out)).toBeGreaterThan(0.85);
  });
});
