import { zoomAtScreen } from "@/features/ascii-engine/scene/camera";
import type { SceneTool } from "@/features/ascii-engine/tools/types";

export const zoomTool: SceneTool = {
  id: "zoom",
  label: "Zoom",
  cursor: "zoom-in",
  onPointerDown(ctx, ev) {
    const factor = ev.altKey ? 1 / 1.25 : 1.25;
    const next = zoomAtScreen(
      ctx.camera,
      factor,
      { x: ev.screenX, y: ev.screenY },
      ctx.viewport,
      ctx.cellSize,
    );
    ctx.setCamera(next);
    ctx.requestRender();
  },
};
