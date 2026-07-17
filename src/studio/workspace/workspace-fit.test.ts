import { describe, expect, it } from "vitest";

import { computeFitScale, zoomToScale } from "@/studio/workspace/types";
import { measureAsciiLayout } from "@/features/ascii-interaction/utils/layout-size";

describe("never-crop fit math", () => {
  it("computeFitScale shrinks content larger than viewport", () => {
    // content 840×2616 in 800×600 viewport
    const fit = computeFitScale(800, 600, 840, 2616, "fit");
    expect(fit).toBeLessThan(1);
    expect(fit).toBeCloseTo(600 / 2616, 5);
    expect(840 * fit).toBeLessThanOrEqual(800 + 0.01);
    expect(2616 * fit).toBeLessThanOrEqual(600 + 0.01);
  });

  it("fit-width and fit-height differ for tall art", () => {
    const fw = computeFitScale(800, 600, 840, 2616, "fit-width");
    const fh = computeFitScale(800, 600, 840, 2616, "fit-height");
    expect(fw).toBeCloseTo(800 / 840, 5);
    expect(fh).toBeCloseTo(600 / 2616, 5);
    expect(fw).toBeGreaterThan(fh);
  });

  it("zoomToScale maps presets", () => {
    expect(zoomToScale("fit", 0.5, 0.9, 0.4)).toBe(0.5);
    expect(zoomToScale("fit-width", 0.5, 0.9, 0.4)).toBe(0.9);
    expect(zoomToScale("fit-height", 0.5, 0.9, 0.4)).toBe(0.4);
    expect(zoomToScale(2, 0.5, 0.9, 0.4)).toBe(2);
  });

  it("measureAsciiLayout preserves aspect of matrix", () => {
    const layout = measureAsciiLayout(
      {
        cols: 120,
        rows: 60,
        charset: " .#",
        cells: [],
      },
      { cellWidth: 7, cellHeight: 12 },
    );
    expect(layout.width).toBe(840);
    expect(layout.height).toBe(720);
    expect(layout.width / layout.height).toBeCloseTo((120 * 7) / (60 * 12), 5);
  });
});
