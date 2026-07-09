import { describe, expect, it } from "vitest";

import { DEFAULT_ASCII_INTERACTION_CONFIG } from "@/features/ascii-interaction/config";
import { CharacterGrid } from "@/features/ascii-interaction/grid/character-grid";
import { AsciiInteractionEngineCore } from "@/features/ascii-interaction/engine/ascii-interaction-engine-core";
import type { AsciiMatrix } from "@/features/ascii-interaction/image-pipeline/types";

function denseMatrix(cols: number, rows: number, fill = "#"): AsciiMatrix {
  const cells = [];
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      cells.push({
        char: fill,
        col,
        row,
        luminance: 0.8,
        r: 0,
        g: 200,
        b: 0,
      });
    }
  }
  return { cols, rows, charset: " .#@", cells };
}

describe("CharacterGrid.patchFromMatrix", () => {
  it("reuses buffers when cols/rows/count match", () => {
    const a = denseMatrix(4, 3, "#");
    const grid = new CharacterGrid(a, DEFAULT_ASCII_INTERACTION_CONFIG);
    const originX0 = grid.originX;
    const glyph0 = grid.baseGlyphIndex;

    const b = denseMatrix(4, 3, "*");
    expect(grid.canPatchFrom(b)).toBe(true);
    expect(grid.patchFromMatrix(b, DEFAULT_ASCII_INTERACTION_CONFIG)).toBe(true);

    expect(grid.originX).toBe(originX0);
    expect(grid.baseGlyphIndex).toBe(glyph0);
    expect(grid.getBaseGlyphChar(0)).toBe("*");
    expect(grid.count).toBe(12);
  });

  it("returns false when count differs (sparse)", () => {
    const dense = denseMatrix(3, 2, "#");
    const grid = new CharacterGrid(dense, DEFAULT_ASCII_INTERACTION_CONFIG);

    const sparse: AsciiMatrix = {
      cols: 3,
      rows: 2,
      charset: " .#@",
      cells: [
        { char: "#", col: 0, row: 0, luminance: 1, r: 0, g: 255, b: 0 },
        { char: "#", col: 2, row: 1, luminance: 1, r: 0, g: 255, b: 0 },
      ],
    };

    expect(grid.canPatchFrom(sparse)).toBe(false);
    expect(grid.patchFromMatrix(sparse, DEFAULT_ASCII_INTERACTION_CONFIG)).toBe(false);
  });

  it("returns false when cols/rows differ", () => {
    const grid = new CharacterGrid(denseMatrix(4, 3), DEFAULT_ASCII_INTERACTION_CONFIG);
    const other = denseMatrix(5, 3);
    expect(grid.patchFromMatrix(other, DEFAULT_ASCII_INTERACTION_CONFIG)).toBe(false);
  });
});

describe("AsciiInteractionEngineCore.patchSource", () => {
  it("patches in-place when dims stable", () => {
    const core = new AsciiInteractionEngineCore(denseMatrix(4, 2, "#"));
    const patched = core.patchSource(denseMatrix(4, 2, "*"));
    expect(patched).toBe(true);
  });

  it("falls back to setSource when count changes", () => {
    const core = new AsciiInteractionEngineCore(denseMatrix(3, 2, "#"));
    const sparse: AsciiMatrix = {
      cols: 3,
      rows: 2,
      charset: " .#@",
      cells: [{ char: "#", col: 0, row: 0, luminance: 1, r: 0, g: 255, b: 0 }],
    };
    const patched = core.patchSource(sparse);
    expect(patched).toBe(false);
  });
});
