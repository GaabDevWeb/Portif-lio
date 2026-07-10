import type { SceneTool, SceneToolContext, PointerWorld } from "@/features/ascii-engine/tools/types";
import { brushTool, pencilTool } from "@/features/ascii-engine/tools/brush-tool";
import { eraserTool } from "@/features/ascii-engine/tools/eraser-tool";
import { fillTool } from "@/features/ascii-engine/tools/fill-tool";
import { moveTool } from "@/features/ascii-engine/tools/move-tool";
import { handTool } from "@/features/ascii-engine/tools/hand-tool";
import { zoomTool } from "@/features/ascii-engine/tools/zoom-tool";

export const SCENE_TOOLS: SceneTool[] = [
  brushTool,
  pencilTool,
  eraserTool,
  fillTool,
  moveTool,
  handTool,
  zoomTool,
];

export type SceneToolId = (typeof SCENE_TOOLS)[number]["id"];

/**
 * ToolHost — regista tools independentes e despacha pointer/key events.
 * Nenhuma tool importa outra.
 */
export class ToolHost {
  private tools = new Map<string, SceneTool>();
  private activeId: string = "brush";

  constructor(tools: SceneTool[] = SCENE_TOOLS) {
    for (const t of tools) {
      this.register(t);
    }
  }

  register(tool: SceneTool): void {
    this.tools.set(tool.id, tool);
  }

  list(): SceneTool[] {
    return [...this.tools.values()];
  }

  getActiveId(): string {
    return this.activeId;
  }

  getActive(): SceneTool | undefined {
    return this.tools.get(this.activeId);
  }

  setActive(id: string): boolean {
    if (!this.tools.has(id)) return false;
    this.activeId = id;
    return true;
  }

  pointerDown(ctx: SceneToolContext, ev: PointerWorld): void {
    this.getActive()?.onPointerDown?.(ctx, ev);
  }

  pointerMove(ctx: SceneToolContext, ev: PointerWorld): void {
    this.getActive()?.onPointerMove?.(ctx, ev);
  }

  pointerUp(ctx: SceneToolContext, ev: PointerWorld): void {
    this.getActive()?.onPointerUp?.(ctx, ev);
  }

  keyDown(
    ctx: SceneToolContext,
    key: string,
    mods: { shiftKey: boolean; altKey: boolean },
  ): void {
    this.getActive()?.onKeyDown?.(ctx, key, mods);
  }
}

export function createDefaultToolHost(): ToolHost {
  return new ToolHost(SCENE_TOOLS);
}
