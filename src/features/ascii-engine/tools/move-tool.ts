import type { SceneTool } from "@/features/ascii-engine/tools/types";
import type { SceneDocumentData } from "@/features/ascii-engine/scene/types";

let moveActive = false;
let moveBefore: SceneDocumentData | null = null;
let startWorld = { x: 0, y: 0 };
let startTransforms: Record<string, { x: number; y: number }> = {};

function hitTestObject(
  scene: import("@/features/ascii-engine/scene/scene-document").SceneDocument,
  col: number,
  row: number,
): string | null {
  const objects = scene.getObjects();
  for (let i = objects.length - 1; i >= 0; i--) {
    const o = objects[i]!;
    if (!o.visible) continue;
    const x = Math.floor(o.transform.x);
    const y = Math.floor(o.transform.y);
    if (col >= x && row >= y && col < x + o.bounds.w && row < y + o.bounds.h) {
      return o.id;
    }
  }
  return null;
}

export const moveTool: SceneTool = {
  id: "move",
  label: "Move",
  cursor: "move",
  onPointerDown(ctx, ev) {
    let activeIds =
      ctx.selection.getObjectIds().length > 0
        ? ctx.selection.getObjectIds()
        : ctx.scene.getSelectedObjectIds();

    if (activeIds.length === 0) {
      const hit = hitTestObject(ctx.scene, ev.col, ev.row);
      if (!hit) return;
      ctx.scene.setSelectedObjectIds([hit]);
      ctx.selection.setObjectIds([hit]);
      activeIds = [hit];
    }

    moveActive = true;
    moveBefore = ctx.scene.toJSON();
    startWorld = { x: ev.world.x, y: ev.world.y };
    startTransforms = {};
    for (const id of activeIds) {
      const obj = ctx.scene.getObject(id);
      if (!obj || obj.locked) continue;
      startTransforms[id] = { x: obj.transform.x, y: obj.transform.y };
    }
  },
  onPointerMove(ctx, ev) {
    if (!moveActive || (ev.buttons & 1) === 0) return;
    const dx = ev.world.x - startWorld.x;
    const dy = ev.world.y - startWorld.y;
    for (const [id, start] of Object.entries(startTransforms)) {
      const obj = ctx.scene.getObject(id);
      if (!obj) continue;
      ctx.scene.updateObject(id, {
        transform: {
          ...obj.transform,
          x: start.x + dx,
          y: start.y + dy,
        },
      });
    }
    ctx.requestRender();
  },
  onPointerUp(ctx) {
    if (moveActive && moveBefore) {
      const before = moveBefore;
      const after = ctx.scene.toJSON();
      ctx.history.push({
        label: "Move",
        execute() {
          ctx.scene.replaceData(after);
        },
        undo() {
          ctx.scene.replaceData(before);
        },
      });
    }
    moveActive = false;
    moveBefore = null;
    startTransforms = {};
    ctx.requestRender();
  },
};
