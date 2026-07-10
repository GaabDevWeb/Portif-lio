import { describe, expect, it } from "vitest";

import {
  ToolHost,
  SCENE_TOOLS,
  createDefaultToolHost,
  SelectionModel,
} from "@/features/ascii-engine/tools";
import {
  screenToWorld,
  worldToScreen,
  fitCameraToBounds,
  clampZoom,
} from "@/features/ascii-engine/scene/camera";

describe("ToolHost registry", () => {
  it("registers all base tools", () => {
    const host = createDefaultToolHost();
    const ids = host.list().map((t) => t.id);
    expect(ids).toEqual(
      expect.arrayContaining(["brush", "pencil", "eraser", "fill", "move", "hand", "zoom"]),
    );
    expect(SCENE_TOOLS).toHaveLength(7);
  });

  it("switches active tool", () => {
    const host = new ToolHost();
    expect(host.getActiveId()).toBe("brush");
    expect(host.setActive("hand")).toBe(true);
    expect(host.getActiveId()).toBe("hand");
    expect(host.getActive()?.cursor).toBe("grab");
    expect(host.setActive("nope")).toBe(false);
  });
});

describe("SelectionModel", () => {
  it("tracks object ids and cell region", () => {
    const sel = new SelectionModel();
    sel.setObjectIds(["a", "b"]);
    sel.setCellRegion({ x: 1, y: 2, w: 3, h: 4 });
    expect(sel.getObjectIds()).toEqual(["a", "b"]);
    expect(sel.getCellRegion()).toEqual({ x: 1, y: 2, w: 3, h: 4 });
    sel.clear();
    expect(sel.hasObjects()).toBe(false);
    expect(sel.getCellRegion()).toBeNull();
  });
});

describe("WorkspaceCamera", () => {
  const cell = { width: 8, height: 12 };
  const viewport = { width: 800, height: 600 };

  it("round-trips screen ↔ world at center", () => {
    const camera = { x: 40, y: 20, zoom: 1 };
    const world = screenToWorld({ x: 400, y: 300 }, camera, viewport, cell);
    expect(world.x).toBeCloseTo(40);
    expect(world.y).toBeCloseTo(20);
    const screen = worldToScreen(world, camera, viewport, cell);
    expect(screen.x).toBeCloseTo(400);
    expect(screen.y).toBeCloseTo(300);
  });

  it("fits camera to scene bounds", () => {
    const fitted = fitCameraToBounds({ x: 0, y: 0, w: 80, h: 40 }, viewport, cell);
    expect(fitted.x).toBe(40);
    expect(fitted.y).toBe(20);
    expect(fitted.zoom).toBeGreaterThan(0);
    expect(clampZoom(0.001)).toBeGreaterThan(0);
  });
});
