import type { SceneCameraState } from "@/features/ascii-engine/scene/types";

export interface CellSize {
  width: number;
  height: number;
}

export interface ViewportSize {
  width: number;
  height: number;
}

export interface WorldPoint {
  /** Fractional world cell column. */
  x: number;
  /** Fractional world cell row. */
  y: number;
}

export interface ScreenPoint {
  x: number;
  y: number;
}

export interface SceneBoundsRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export const MIN_CAMERA_ZOOM = 0.05;
export const MAX_CAMERA_ZOOM = 32;

export function clampZoom(zoom: number): number {
  return Math.min(MAX_CAMERA_ZOOM, Math.max(MIN_CAMERA_ZOOM, zoom));
}

/**
 * Workspace camera helpers — world coords in cells.
 * Camera (x,y) is the world-cell position at the viewport center.
 */
export function screenToWorld(
  screen: ScreenPoint,
  camera: Pick<SceneCameraState, "x" | "y" | "zoom">,
  viewport: ViewportSize,
  cell: CellSize,
): WorldPoint {
  const z = clampZoom(camera.zoom);
  return {
    x: camera.x + (screen.x - viewport.width / 2) / (cell.width * z),
    y: camera.y + (screen.y - viewport.height / 2) / (cell.height * z),
  };
}

export function worldToScreen(
  world: WorldPoint,
  camera: Pick<SceneCameraState, "x" | "y" | "zoom">,
  viewport: ViewportSize,
  cell: CellSize,
): ScreenPoint {
  const z = clampZoom(camera.zoom);
  return {
    x: viewport.width / 2 + (world.x - camera.x) * cell.width * z,
    y: viewport.height / 2 + (world.y - camera.y) * cell.height * z,
  };
}

/** Floor to integer cell indices (for painting). */
export function worldToCell(world: WorldPoint): { col: number; row: number } {
  return { col: Math.floor(world.x), row: Math.floor(world.y) };
}

export function panCamera(
  camera: SceneCameraState,
  deltaWorldX: number,
  deltaWorldY: number,
): SceneCameraState {
  return {
    ...camera,
    x: camera.x + deltaWorldX,
    y: camera.y + deltaWorldY,
  };
}

/** Pan by screen pixels (e.g. pointer drag with hand tool). */
export function panCameraByScreen(
  camera: SceneCameraState,
  deltaScreenX: number,
  deltaScreenY: number,
  cell: CellSize,
): SceneCameraState {
  const z = clampZoom(camera.zoom);
  return panCamera(camera, -deltaScreenX / (cell.width * z), -deltaScreenY / (cell.height * z));
}

export function zoomCamera(
  camera: SceneCameraState,
  nextZoom: number,
  anchorWorld?: WorldPoint,
): SceneCameraState {
  const zoom = clampZoom(nextZoom);
  if (!anchorWorld) {
    return { ...camera, zoom };
  }
  // Keep anchor under the same screen point by adjusting center.
  return {
    ...camera,
    zoom,
    x: anchorWorld.x - (anchorWorld.x - camera.x) * (camera.zoom / zoom),
    y: anchorWorld.y - (anchorWorld.y - camera.y) * (camera.zoom / zoom),
  };
}

export function zoomAtScreen(
  camera: SceneCameraState,
  factor: number,
  screen: ScreenPoint,
  viewport: ViewportSize,
  cell: CellSize,
): SceneCameraState {
  const world = screenToWorld(screen, camera, viewport, cell);
  return zoomCamera(camera, camera.zoom * factor, world);
}

export function fitCameraToBounds(
  bounds: SceneBoundsRect,
  viewport: ViewportSize,
  cell: CellSize,
  padding = 0.9,
): Pick<SceneCameraState, "x" | "y" | "zoom"> {
  const contentW = Math.max(1, bounds.w) * cell.width;
  const contentH = Math.max(1, bounds.h) * cell.height;
  const zoom = clampZoom(
    Math.min(viewport.width / contentW, viewport.height / contentH) * padding,
  );
  return {
    x: bounds.x + bounds.w / 2,
    y: bounds.y + bounds.h / 2,
    zoom,
  };
}

export function sceneContentBounds(
  sceneWidth: number,
  sceneHeight: number,
): SceneBoundsRect {
  return { x: 0, y: 0, w: sceneWidth, h: sceneHeight };
}

/** CSS transform for world layer: center camera, then scale. */
export function cameraWorldTransform(
  camera: Pick<SceneCameraState, "x" | "y" | "zoom">,
  viewport: ViewportSize,
  cell: CellSize,
): string {
  const z = clampZoom(camera.zoom);
  const tx = viewport.width / 2 - camera.x * cell.width * z;
  const ty = viewport.height / 2 - camera.y * cell.height * z;
  return `translate(${tx}px, ${ty}px) scale(${z})`;
}
