import { describe, expect, it } from "vitest";

import { BrushEngine, getBrushPreset, BRUSH_PRESETS } from "@/features/ascii-engine/brush";
import { emptyMatrix } from "@/features/ascii-engine/scene";

describe("BrushEngine", () => {
  it("stamps at least one cell for pencil preset", () => {
    const preset = getBrushPreset("pencil");
    expect(preset).toBeTruthy();
    const engine = new BrushEngine(preset);
    const cells = engine.stampCells({ col: 5, row: 3, seed: 42 });
    expect(cells.length).toBeGreaterThanOrEqual(1);
    expect(cells.some((c) => c.col === 5 && c.row === 3)).toBe(true);
  });

  it("stampInto writes into matrix bounds", () => {
    const engine = new BrushEngine(getBrushPreset("brush"));
    const matrix = emptyMatrix(10, 10);
    const written = engine.stampInto(matrix, { col: 4, row: 4, seed: 7 });
    expect(written).toBeGreaterThan(0);
    expect(matrix.cells.some((c) => c.char !== " ")).toBe(true);
  });

  it("eraseInto clears cells", () => {
    const engine = new BrushEngine(getBrushPreset("pencil"));
    const matrix = emptyMatrix(5, 5);
    engine.stampInto(matrix, { col: 2, row: 2, seed: 1 });
    expect(matrix.cells[2 * 5 + 2]!.char).not.toBe(" ");
    engine.eraseInto(matrix, 2, 2, 1);
    expect(matrix.cells[2 * 5 + 2]!.char).toBe(" ");
  });

  it("exposes ready and experimental presets", () => {
    expect(BRUSH_PRESETS.some((p) => p.id === "pencil" && p.status === "ready")).toBe(true);
    expect(BRUSH_PRESETS.some((p) => p.id === "fire" && p.status === "experimental")).toBe(true);
  });

  it("is deterministic with the same seed", () => {
    const engine = new BrushEngine(getBrushPreset("spray"));
    const a = engine.stampCells({ col: 0, row: 0, seed: 99 });
    const b = engine.stampCells({ col: 0, row: 0, seed: 99 });
    expect(a).toEqual(b);
  });
});
