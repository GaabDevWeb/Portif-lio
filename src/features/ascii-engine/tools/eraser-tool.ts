import type { SceneTool, SceneToolContext, PointerWorld } from "@/features/ascii-engine/tools/types";
import type { SceneDocumentData } from "@/features/ascii-engine/scene/types";

let eraseActive = false;
let eraseTargetId: string | null = null;
let eraseBefore: SceneDocumentData | null = null;

function applyErase(ctx: SceneToolContext, ev: PointerWorld): void {
  const targetId =
    eraseTargetId ??
    ctx.selection.getObjectIds()[0] ??
    ctx.scene.getSelectedObjectIds()[0] ??
    null;
  if (!targetId) return;
  const obj = ctx.scene.getObject(targetId);
  if (!obj || obj.locked) return;

  const size = Math.max(1, Math.round(ctx.brush.getPreset().size));
  const localCol = ev.col - Math.floor(obj.transform.x);
  const localRow = ev.row - Math.floor(obj.transform.y);

  if (obj.type === "image") {
    const matrix = structuredClone(obj.payload.matrix);
    ctx.brush.eraseInto(matrix, localCol, localRow, size);
    ctx.scene.replaceObjectPayload(targetId, "image", { ...obj.payload, matrix });
    eraseTargetId = targetId;
  } else if (obj.type === "stroke" && obj.payload.baked) {
    const matrix = structuredClone(obj.payload.baked);
    ctx.brush.eraseInto(matrix, localCol, localRow, size);
    ctx.scene.replaceObjectPayload(targetId, "stroke", { ...obj.payload, baked: matrix });
    eraseTargetId = targetId;
  }
}

export const eraserTool: SceneTool = {
  id: "eraser",
  label: "Eraser",
  cursor: "cell",
  onPointerDown(ctx, ev) {
    eraseActive = true;
    eraseBefore = ctx.scene.toJSON();
    eraseTargetId = null;
    applyErase(ctx, ev);
    ctx.requestRender();
  },
  onPointerMove(ctx, ev) {
    if (!eraseActive || (ev.buttons & 1) === 0) return;
    applyErase(ctx, ev);
    ctx.requestRender();
  },
  onPointerUp(ctx) {
    if (eraseActive && eraseBefore && eraseTargetId) {
      const before = eraseBefore;
      const after = ctx.scene.toJSON();
      // execute is idempotent (scene already at after)
      ctx.history.push({
        label: "Erase",
        execute() {
          ctx.scene.replaceData(after);
        },
        undo() {
          ctx.scene.replaceData(before);
        },
      });
    }
    eraseActive = false;
    eraseBefore = null;
    eraseTargetId = null;
    ctx.requestRender();
  },
};
