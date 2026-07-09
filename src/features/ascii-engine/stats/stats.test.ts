import { describe, expect, it } from "vitest";
import type { AsciiMatrix } from "@/features/ascii-interaction/image-pipeline/types";
import {
  buildCharacterHistogram,
  buildLuminanceHeatmap,
  buildStatsPanelModel,
  formatHeatmapPreview,
} from "@/features/ascii-engine/stats";

const matrix: AsciiMatrix = {
  cols: 3,
  rows: 2,
  charset: " .:-=+*#%@",
  cells: [
    { char: "#", col: 0, row: 0, luminance: 1, r: 255, g: 255, b: 255 },
    { char: ".", col: 1, row: 0, luminance: 0.2, r: 50, g: 50, b: 50 },
    { char: " ", col: 2, row: 0, luminance: 0, r: 0, g: 0, b: 0 },
    { char: "*", col: 0, row: 1, luminance: 0.6, r: 150, g: 150, b: 150 },
    { char: "=", col: 1, row: 1, luminance: 0.4, r: 100, g: 100, b: 100 },
    { char: "-", col: 2, row: 1, luminance: 0.1, r: 25, g: 25, b: 25 },
  ],
};

describe("luminance heatmap", () => {
  it("builds row-major values and coverage stats", () => {
    const hm = buildLuminanceHeatmap(matrix);
    expect(hm).not.toBeNull();
    expect(hm!.cols).toBe(3);
    expect(hm!.rows).toBe(2);
    expect(hm!.values.length).toBe(6);
    expect(hm!.values[0]).toBe(1);
    expect(hm!.values[2]).toBe(0);
    expect(hm!.min).toBe(0);
    expect(hm!.max).toBe(1);
    expect(hm!.mean).toBeCloseTo((1 + 0.2 + 0 + 0.6 + 0.4 + 0.1) / 6, 5);
    // threshold 0.05 → 5 of 6 cells above
    expect(hm!.coverage).toBeCloseTo(5 / 6, 5);
  });

  it("returns null for empty matrix", () => {
    expect(buildLuminanceHeatmap(null)).toBeNull();
    expect(buildLuminanceHeatmap({ cols: 0, rows: 0, charset: "", cells: [] })).toBeNull();
  });

  it("formatHeatmapPreview downsamples to ASCII ramp", () => {
    const hm = buildLuminanceHeatmap(matrix)!;
    const preview = formatHeatmapPreview(hm, 3, 2);
    const lines = preview.split("\n");
    expect(lines).toHaveLength(2);
    expect(lines[0]!.length).toBe(3);
  });

  it("buildStatsPanelModel includes heatmap when matrix present", () => {
    const model = buildStatsPanelModel({ matrix });
    expect(model.heatmap).not.toBeNull();
    expect(model.heatmap!.coverage).toBeGreaterThan(0);
    expect(model.histogram.length).toBeGreaterThan(0);
    expect(buildCharacterHistogram(matrix, 2)).toHaveLength(2);
  });
});
