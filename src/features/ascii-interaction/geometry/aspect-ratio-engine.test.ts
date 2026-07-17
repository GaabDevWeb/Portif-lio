import { describe, expect, it } from "vitest";

import {
  metricsFromCellSize,
  renderedAspect,
  resolveGridSize,
  sourceAspect,
} from "@/features/ascii-interaction/geometry/aspect-ratio-engine";

const cell7x12 = metricsFromCellSize(7, 12);

describe("AspectRatioEngine.resolveGridSize", () => {
  it("keeps square source square after 7×12 render", () => {
    const grid = resolveGridSize({
      imgWidth: 1000,
      imgHeight: 1000,
      cols: 120,
      metrics: cell7x12,
    });
    expect(grid.cols).toBe(120);
    expect(grid.rows).toBe(70); // 120 * 7/12
    const aspect = renderedAspect(grid.cols, grid.rows, cell7x12);
    expect(Math.abs(aspect - 1)).toBeLessThan(0.02);
  });

  it("preserves portrait source aspect", () => {
    const grid = resolveGridSize({
      imgWidth: 800,
      imgHeight: 1600,
      cols: 80,
      metrics: cell7x12,
    });
    const src = sourceAspect(800, 1600);
    const out = renderedAspect(grid.cols, grid.rows, cell7x12);
    expect(Math.abs(out - src) / src).toBeLessThan(0.03);
  });

  it("preserves landscape source aspect", () => {
    const grid = resolveGridSize({
      imgWidth: 1600,
      imgHeight: 800,
      cols: 120,
      metrics: cell7x12,
    });
    const src = sourceAspect(1600, 800);
    const out = renderedAspect(grid.cols, grid.rows, cell7x12);
    expect(Math.abs(out - src) / src).toBeLessThan(0.03);
  });

  it("matches user eye fixture geometry (564×778)", () => {
    const grid = resolveGridSize({
      imgWidth: 564,
      imgHeight: 778,
      cols: 120,
      metrics: cell7x12,
    });
    const src = sourceAspect(564, 778);
    const out = renderedAspect(grid.cols, grid.rows, cell7x12);
    expect(Math.abs(out - src) / src).toBeLessThan(0.02);
    // Must NOT be the old FC=0.55 disaster (~3× stretch)
    expect(out).toBeGreaterThan(0.6);
  });

  it("ignores legacy fontCompensation by not accepting it in input", () => {
    // API has no fontCompensation — geometry only from cell metrics
    const a = resolveGridSize({
      imgWidth: 1000,
      imgHeight: 1000,
      cols: 100,
      metrics: cell7x12,
    });
    const b = resolveGridSize({
      imgWidth: 1000,
      imgHeight: 1000,
      cols: 100,
      metrics: metricsFromCellSize(7, 12),
    });
    expect(a).toEqual(b);
  });

  it("honours explicit rows when lockAspectRatio is false", () => {
    const grid = resolveGridSize({
      imgWidth: 1000,
      imgHeight: 1000,
      cols: 80,
      rows: 40,
      lockAspectRatio: false,
      metrics: cell7x12,
    });
    expect(grid).toEqual({ cols: 80, rows: 40 });
  });
});
