import { describe, expect, it } from "vitest";

import {
  CommandHistory,
  EditorDocument,
  EDITOR_TOOLS,
  floodFillPatches,
  getCharAt,
  patchMatrixCells,
} from "@/features/ascii-engine/editor";
import type { AsciiMatrix } from "@/features/ascii-interaction/image-pipeline/types";

function grid(cols: number, rows: number, fill = "."): AsciiMatrix {
  const cells = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      cells.push({
        char: fill,
        col,
        row,
        luminance: 0.5,
        r: 0,
        g: 200,
        b: 0,
      });
    }
  }
  return { cols, rows, charset: " .#@", cells };
}

describe("EDITOR_TOOLS readiness", () => {
  it("marks brush/eraser/fill/select as ready", () => {
    const ready = EDITOR_TOOLS.filter((t) => t.status === "ready").map((t) => t.id);
    expect(ready).toEqual(expect.arrayContaining(["select", "brush", "eraser", "fill"]));
  });
});

describe("matrix-ops", () => {
  it("patches cells immutably", () => {
    const m = grid(3, 2, ".");
    const next = patchMatrixCells(m, [{ col: 1, row: 0, char: "#" }]);
    expect(next).not.toBe(m);
    expect(getCharAt(m, 1, 0)).toBe(".");
    expect(getCharAt(next, 1, 0)).toBe("#");
  });

  it("flood fills connected region", () => {
    const m = grid(4, 3, ".");
    // wall of # splitting left/right
    m.cells = m.cells.map((c) =>
      c.col === 2 ? { ...c, char: "#" } : c,
    );
    const patches = floodFillPatches(m, 0, 1, "@");
    expect(patches.length).toBe(6); // cols 0-1 × rows 0-2
    const filled = patchMatrixCells(m, patches);
    expect(getCharAt(filled, 0, 0)).toBe("@");
    expect(getCharAt(filled, 1, 2)).toBe("@");
    expect(getCharAt(filled, 2, 0)).toBe("#");
    expect(getCharAt(filled, 3, 0)).toBe(".");
  });
});

describe("CommandHistory", () => {
  it("undo/redo with max size", () => {
    const hist = new CommandHistory(3);
    let value = 0;
    const make = (n: number) => ({
      label: `set-${n}`,
      execute: () => {
        value = n;
      },
      undo: () => {
        value = n - 1;
      },
    });
    hist.push(make(1));
    hist.push(make(2));
    hist.push(make(3));
    hist.push(make(4));
    expect(hist.undoDepth).toBe(3);
    expect(value).toBe(4);
    hist.undo();
    expect(value).toBe(3);
    hist.redo();
    expect(value).toBe(4);
  });
});

describe("EditorDocument paint + undo", () => {
  it("brush paints and undoes 20 steps", () => {
    const doc = new EditorDocument(64);
    const layerId = doc.getState().activeLayerId;
    doc.setLayerMatrix(layerId, grid(8, 4, "."));
    // setLayerMatrix counts as 1 history entry
    expect(doc.getHistoryDepth().undo).toBe(1);

    doc.setActiveTool("brush");
    doc.setStrokeChar("#");

    for (let i = 0; i < 20; i++) {
      const col = i % 8;
      const row = Math.floor(i / 8);
      expect(doc.paintAt(col, row)).toBe(true);
      expect(doc.getCharAt(col, row)).toBe("#");
    }

    expect(doc.getHistoryDepth().undo).toBe(21); // 1 matrix + 20 paints

    for (let i = 19; i >= 0; i--) {
      expect(doc.undo()).toBe(true);
      const col = i % 8;
      const row = Math.floor(i / 8);
      expect(doc.getCharAt(col, row)).toBe(".");
    }

    // matrix set still undoable
    expect(doc.getState().canUndo).toBe(true);
    expect(doc.getCharAt(0, 0)).toBe(".");
  });

  it("eraser clears painted cells", () => {
    const doc = new EditorDocument();
    const layerId = doc.getState().activeLayerId;
    doc.setLayerMatrix(layerId, grid(3, 3, "#"));
    doc.setActiveTool("eraser");
    expect(doc.eraseAt(1, 1)).toBe(true);
    expect(doc.getCharAt(1, 1)).toBe(" ");
    expect(doc.undo()).toBe(true);
    expect(doc.getCharAt(1, 1)).toBe("#");
  });

  it("fill floods and undoes as one command", () => {
    const doc = new EditorDocument();
    const layerId = doc.getState().activeLayerId;
    doc.setLayerMatrix(layerId, grid(5, 5, "."));
    doc.setStrokeChar("@");
    expect(doc.fillAt(2, 2)).toBe(true);
    expect(doc.getCharAt(0, 0)).toBe("@");
    expect(doc.getCharAt(4, 4)).toBe("@");
    expect(doc.getHistoryDepth().undo).toBe(2); // setMatrix + fill
    expect(doc.undo()).toBe(true);
    expect(doc.getCharAt(0, 0)).toBe(".");
  });

  it("selection is undoable via command", () => {
    const doc = new EditorDocument();
    doc.setSelection({ col: 1, row: 2, cols: 3, rows: 2 });
    expect(doc.getState().selection).toEqual({ col: 1, row: 2, cols: 3, rows: 2 });
    expect(doc.undo()).toBe(true);
    expect(doc.getState().selection).toBeNull();
    expect(doc.redo()).toBe(true);
    expect(doc.getState().selection?.cols).toBe(3);
  });

  it("redo restores brush stroke", () => {
    const doc = new EditorDocument();
    doc.setLayerMatrix(doc.getState().activeLayerId, grid(2, 2, "."));
    doc.setStrokeChar("X");
    doc.paintAt(0, 0);
    doc.undo();
    expect(doc.getCharAt(0, 0)).toBe(".");
    doc.redo();
    expect(doc.getCharAt(0, 0)).toBe("X");
  });

  it("respects selection bounds for brush", () => {
    const doc = new EditorDocument();
    doc.setLayerMatrix(doc.getState().activeLayerId, grid(4, 4, "."));
    doc.setSelection({ col: 1, row: 1, cols: 2, rows: 2 });
    doc.setStrokeChar("#");
    expect(doc.paintAt(0, 0)).toBe(false);
    expect(doc.paintAt(1, 1)).toBe(true);
    expect(doc.getCharAt(0, 0)).toBe(".");
    expect(doc.getCharAt(1, 1)).toBe("#");
  });
});
