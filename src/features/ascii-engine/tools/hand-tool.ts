import { panCameraByScreen } from "@/features/ascii-engine/scene/camera";
import type { SceneTool } from "@/features/ascii-engine/tools/types";

let handActive = false;
let lastScreen = { x: 0, y: 0 };

export const handTool: SceneTool = {
  id: "hand",
  label: "Hand",
  cursor: "grab",
  onPointerDown(_ctx, ev) {
    handActive = true;
    lastScreen = { x: ev.screenX, y: ev.screenY };
  },
  onPointerMove(ctx, ev) {
    if (!handActive || (ev.buttons & 1) === 0) return;
    const dx = ev.screenX - lastScreen.x;
    const dy = ev.screenY - lastScreen.y;
    lastScreen = { x: ev.screenX, y: ev.screenY };
    const next = panCameraByScreen(ctx.camera, dx, dy, ctx.cellSize);
    ctx.setCamera(next);
    ctx.requestRender();
  },
  onPointerUp() {
    handActive = false;
  },
};
