import { runWithHistory } from "@/features/ascii-engine/scene/history";
import type { SceneTool } from "@/features/ascii-engine/tools/types";
import type { AsciiMatrixCell } from "@/features/ascii-interaction/image-pipeline/types";

function cellAt(cells: AsciiMatrixCell[], cols: number, col: number, row: number) {
  if (col < 0 || row < 0) return undefined;
  return cells[row * cols + col];
}

/** Flood fill on selected image/stroke object (or no-op if none). */
export const fillTool: SceneTool = {
  id: "fill",
  label: "Fill",
  cursor: "cell",
  onPointerDown(ctx, ev) {
    const targetId =
      ctx.selection.getObjectIds()[0] ?? ctx.scene.getSelectedObjectIds()[0] ?? null;
    if (!targetId) return;
    const obj = ctx.scene.getObject(targetId);
    if (!obj || obj.locked) return;
    if (obj.type !== "image" && !(obj.type === "stroke" && obj.payload.baked)) return;

    const matrix =
      obj.type === "image"
        ? structuredClone(obj.payload.matrix)
        : structuredClone(obj.payload.baked!);
    const localCol = ev.col - Math.floor(obj.transform.x);
    const localRow = ev.row - Math.floor(obj.transform.y);
    if (localCol < 0 || localRow < 0 || localCol >= matrix.cols || localRow >= matrix.rows) {
      return;
    }

    const start = cellAt(matrix.cells, matrix.cols, localCol, localRow);
    if (!start) return;
    const targetChar = start.char;
    const fillChar = ctx.brush.getPreset().charset[0] ?? "#";
    const color = ctx.brush.getPreset().colors[0] ?? { r: 0, g: 255, b: 100 };
    if (targetChar === fillChar) return;

    const stack: Array<[number, number]> = [[localCol, localRow]];
    const seen = new Set<string>();
    while (stack.length > 0) {
      const [c, r] = stack.pop()!;
      const key = `${c},${r}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const cell = cellAt(matrix.cells, matrix.cols, c, r);
      if (!cell || cell.char !== targetChar) continue;
      const idx = r * matrix.cols + c;
      matrix.cells[idx] = {
        ...cell,
        char: fillChar,
        luminance: 1,
        r: color.r,
        g: color.g,
        b: color.b,
      };
      stack.push([c + 1, r], [c - 1, r], [c, r + 1], [c, r - 1]);
      if (seen.size > matrix.cols * matrix.rows) break;
    }

    runWithHistory(ctx.history, ctx.scene, "Fill", () => {
      if (obj.type === "image") {
        ctx.scene.replaceObjectPayload(targetId, "image", { ...obj.payload, matrix });
      } else {
        ctx.scene.replaceObjectPayload(targetId, "stroke", { ...obj.payload, baked: matrix });
      }
    });
    ctx.requestRender();
  },
};
