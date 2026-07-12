import { describe, expect, it } from "vitest";

import { detectMotion } from "@/features/ascii-interaction/animation-pipeline/TemporalPipeline/MotionDetector";
import { applyCharacterPersistence } from "@/features/ascii-interaction/animation-pipeline/TemporalPipeline/CharacterPersistence";
import { applyTemporalDither } from "@/features/ascii-interaction/animation-pipeline/TemporalPipeline/TemporalDither";
import { smoothTemporal } from "@/features/ascii-interaction/animation-pipeline/TemporalPipeline/TemporalSmoothing";
import { shouldSkipFrame } from "@/features/ascii-interaction/animation-pipeline/TemporalPipeline/AdaptiveFPS";
import { reuseStaticRegions } from "@/features/ascii-interaction/animation-pipeline/TemporalPipeline/RegionReuse";
import { TemporalConverter } from "@/features/ascii-interaction/animation-pipeline/TemporalPipeline/TemporalConverter";
import { DEFAULT_TEMPORAL_OPTIONS } from "@/features/ascii-interaction/animation-pipeline/TemporalPipeline/types";
import { DEFAULT_ANIMATION_PIPELINE_OPTIONS } from "@/features/ascii-interaction/animation-pipeline/types";
import type { RgbaFrame } from "@/features/ascii-interaction/animation-pipeline/types";

function solidRgba(w: number, h: number, r: number, g: number, b: number, index: number): RgbaFrame {
  const pixels = new Uint8ClampedArray(w * h * 4);
  for (let i = 0; i < w * h; i += 1) {
    const o = i * 4;
    pixels[o] = r;
    pixels[o + 1] = g;
    pixels[o + 2] = b;
    pixels[o + 3] = 255;
  }
  return { index, width: w, height: h, delayMs: 100, pixels };
}

describe("TemporalPipeline modules", () => {
  it("smoothTemporal blends N-1 / N / N+1", () => {
    const prev = new Float32Array([0, 0]);
    const curr = new Float32Array([1, 1]);
    const next = new Float32Array([0.5, 0.5]);
    const out = smoothTemporal(curr, prev, 0.4, next);
    expect(out[0]).toBeGreaterThan(0.4);
    expect(out[0]).toBeLessThan(1);
  });

  it("character persistence keeps glyph inside hysteresis band", () => {
    const lum = new Float32Array([0.5, 0.52]);
    const prev = new Int16Array([5, 5]);
    const { indices, changed } = applyCharacterPersistence(lum, 10, prev, 0.08);
    expect(indices[0]).toBe(5);
    expect(indices[1]).toBe(5);
    expect(changed).toBe(0);
  });

  it("motion detector marks deltas above threshold", () => {
    const a = new Float32Array([0.1, 0.1, 0.1, 0.1]);
    const b = new Float32Array([0.1, 0.9, 0.1, 0.1]);
    const map = detectMotion(b, a, 2, 2, 0.2);
    expect(map.mask[1]).toBe(1);
    expect(map.mask[0]).toBe(0);
    expect(map.motionFraction).toBe(0.25);
  });

  it("temporal dither is deterministic for static mask", () => {
    const field = new Float32Array(16).fill(0.5);
    const mask = new Float32Array(16).fill(0);
    const a = applyTemporalDither(field, 4, 4, mask, 8, true);
    const b = applyTemporalDither(field, 4, 4, mask, 8, true);
    expect([...a]).toEqual([...b]);
  });

  it("adaptive FPS skips near-static frames", () => {
    expect(shouldSkipFrame(0.01, 0.02, true)).toBe(true);
    expect(shouldSkipFrame(0.01, 0.02, false)).toBe(false);
    expect(shouldSkipFrame(0.05, 0.02, true)).toBe(false);
  });

  it("region reuse copies static cells", () => {
    const prev = {
      cols: 2,
      rows: 1,
      charset: " .#",
      cells: [
        { char: "#", col: 0, row: 0, luminance: 1, r: 1, g: 1, b: 1 },
        { char: ".", col: 1, row: 0, luminance: 0.2, r: 0.2, g: 0.2, b: 0.2 },
      ],
    };
    const next = [
      { char: "@", col: 0, row: 0, luminance: 0.9, r: 0.9, g: 0.9, b: 0.9 },
      { char: "%", col: 1, row: 0, luminance: 0.3, r: 0.3, g: 0.3, b: 0.3 },
    ];
    const mask = new Float32Array([1, 0]);
    const { cells, reused } = reuseStaticRegions(next, prev, mask, 2);
    expect(reused).toBe(1);
    expect(cells.find((c) => c.col === 1)?.char).toBe(".");
    expect(cells.find((c) => c.col === 0)?.char).toBe("@");
  });

  it("TemporalConverter produces stable static sequence", async () => {
    const frames = [
      solidRgba(8, 8, 128, 128, 128, 0),
      solidRgba(8, 8, 130, 130, 130, 1),
      solidRgba(8, 8, 128, 128, 128, 2),
    ];
    const converter = new TemporalConverter({
      ...DEFAULT_TEMPORAL_OPTIONS,
      enabled: true,
      adaptiveFps: false,
      roiPriority: false,
    });
    const out = await converter.convertSequence(
      frames,
      {
        ...DEFAULT_ANIMATION_PIPELINE_OPTIONS.pipeline,
        width: 12,
        height: 0,
        dithering: "none",
      },
    );
    expect(out.length).toBe(3);
    const metrics = converter.getMetrics();
    expect(metrics.frames).toBe(3);
    expect(metrics.temporalStability).toBeGreaterThan(0);
    // Static-ish sequence should reuse some blocks when motion detection is on
    expect(metrics.blocksReused + metrics.charactersUpdated).toBeGreaterThan(0);
  });
});
