import type { AsciiMatrix } from "@/features/ascii-interaction/image-pipeline/types";
import { emptyMatrix } from "@/features/ascii-engine/scene/scene-document";
import { runWithHistory } from "@/features/ascii-engine/scene/history";
import type { SceneTool, SceneToolContext } from "@/features/ascii-engine/tools/types";

function ensureBuffer(ctx: SceneToolContext): AsciiMatrix {
  let buf = ctx.getStrokeBuffer();
  if (!buf || buf.cols !== ctx.scene.getWidth() || buf.rows !== ctx.scene.getHeight()) {
    buf = emptyMatrix(ctx.scene.getWidth(), ctx.scene.getHeight());
    ctx.setStrokeBuffer(buf);
  }
  return buf;
}

function commitStroke(ctx: SceneToolContext, label: string): void {
  const buf = ctx.getStrokeBuffer();
  if (!buf) return;
  const hasInk = buf.cells.some((c) => c.char !== " ");
  if (!hasInk) {
    ctx.setStrokeBuffer(null);
    return;
  }
  const baked = structuredClone(buf);
  let minX = buf.cols;
  let minY = buf.rows;
  let maxX = 0;
  let maxY = 0;
  for (const c of baked.cells) {
    if (c.char === " ") continue;
    minX = Math.min(minX, c.col);
    minY = Math.min(minY, c.row);
    maxX = Math.max(maxX, c.col);
    maxY = Math.max(maxY, c.row);
  }
  const w = Math.max(1, maxX - minX + 1);
  const h = Math.max(1, maxY - minY + 1);
  const cropped = emptyMatrix(w, h, baked.charset);
  for (const c of baked.cells) {
    if (c.char === " ") continue;
    const lc = c.col - minX;
    const lr = c.row - minY;
    const idx = lr * w + lc;
    cropped.cells[idx] = { ...c, col: lc, row: lr };
  }

  const preset = ctx.brush.getPreset();
  runWithHistory(ctx.history, ctx.scene, label, () => {
    ctx.scene.addStrokeObject(
      {
        brushPresetId: preset.id,
        points: [],
        baked: cropped,
      },
      { w, h },
      { x: minX, y: minY, name: label },
    );
  });
  ctx.setStrokeBuffer(null);
  ctx.selection.syncFromScene(ctx.scene.getSelectedObjectIds());
  ctx.requestRender();
}

export const brushTool: SceneTool = {
  id: "brush",
  label: "Brush",
  cursor: "crosshair",
  onPointerDown(ctx, ev) {
    const buf = ensureBuffer(ctx);
    ctx.brush.stampInto(buf, { col: ev.col, row: ev.row, pressure: ev.pressure });
    ctx.requestRender();
  },
  onPointerMove(ctx, ev) {
    if ((ev.buttons & 1) === 0) return;
    const buf = ensureBuffer(ctx);
    ctx.brush.stampInto(buf, { col: ev.col, row: ev.row, pressure: ev.pressure });
    ctx.requestRender();
  },
  onPointerUp(ctx) {
    commitStroke(ctx, "Brush stroke");
  },
};

export const pencilTool: SceneTool = {
  id: "pencil",
  label: "Pencil",
  cursor: "crosshair",
  onPointerDown(ctx, ev) {
    ctx.brush.setPresetById("pencil");
    const buf = ensureBuffer(ctx);
    ctx.brush.stampInto(buf, { col: ev.col, row: ev.row, pressure: 1 });
    ctx.requestRender();
  },
  onPointerMove(ctx, ev) {
    if ((ev.buttons & 1) === 0) return;
    const buf = ensureBuffer(ctx);
    ctx.brush.stampInto(buf, { col: ev.col, row: ev.row, pressure: 1 });
    ctx.requestRender();
  },
  onPointerUp(ctx) {
    commitStroke(ctx, "Pencil stroke");
  },
};
