import { describe, expect, it } from "vitest";

import {
  getCharsetInkCoverage,
  mapLuminanceToCharByDensity,
} from "@/features/ascii-interaction/image-pipeline/charset-mapper";
import { resampleRgba } from "@/features/ascii-interaction/image-pipeline/rgba-processor";

describe("charset density LUT", () => {
  it("orders classic ramp with space lightest and @ densest", () => {
    const charset = " .:-=+*#%@";
    const ink = getCharsetInkCoverage(charset);
    expect(ink[0]!).toBeLessThan(ink[charset.length - 1]!);
    expect(mapLuminanceToCharByDensity(0, charset).char).toBe(" ");
    expect(mapLuminanceToCharByDensity(1, charset).char).toBe("@");
  });
});

describe("resampleRgba area-average", () => {
  it("downscales a solid color without inventing neighbors", () => {
    const w = 4;
    const h = 4;
    const pixels = new Uint8ClampedArray(w * h * 4);
    for (let i = 0; i < w * h; i += 1) {
      pixels[i * 4] = 200;
      pixels[i * 4 + 1] = 100;
      pixels[i * 4 + 2] = 50;
      pixels[i * 4 + 3] = 255;
    }
    const out = resampleRgba(pixels, w, h, 2, 2);
    expect(out.r[0]).toBe(200);
    expect(out.g[0]).toBe(100);
    expect(out.b[0]).toBe(50);
    expect(out.luminance[0]!).toBeGreaterThan(0);
    expect(out.luminance[0]!).toBeLessThan(1);
  });
});
