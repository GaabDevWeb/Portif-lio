export type ZoomPreset = "fit" | "fit-width" | "fit-height" | 1 | 2 | 4 | 8;

export type OriginalViewMode = "split" | "overlay" | "peek";

export interface WorkspacePan {
  x: number;
  y: number;
}

export interface WorkspaceState {
  zoom: ZoomPreset;
  pan: WorkspacePan;
  showOriginal: boolean;
  originalMode: OriginalViewMode;
  focusMode: boolean;
  peeking: boolean;
  sidebarOpen: boolean;
  fullscreen: boolean;
}

export const ZOOM_PRESETS: readonly ZoomPreset[] = [
  "fit",
  "fit-width",
  "fit-height",
  1,
  2,
  4,
  8,
] as const;

export const DEFAULT_WORKSPACE_STATE: WorkspaceState = {
  zoom: "fit",
  pan: { x: 0, y: 0 },
  showOriginal: false,
  originalMode: "peek",
  focusMode: false,
  peeking: false,
  sidebarOpen: false,
  fullscreen: false,
};

export function computeFitScale(
  containerW: number,
  containerH: number,
  contentW: number,
  contentH: number,
  mode: "fit" | "fit-width" | "fit-height" = "fit",
): number {
  if (contentW <= 0 || contentH <= 0 || containerW <= 0 || containerH <= 0) return 1;
  if (mode === "fit-width") return containerW / contentW;
  if (mode === "fit-height") return containerH / contentH;
  return Math.min(containerW / contentW, containerH / contentH);
}

export function zoomToScale(
  zoom: ZoomPreset,
  fitScale: number,
  fitWidthScale: number,
  fitHeightScale: number,
): number {
  if (zoom === "fit") return fitScale;
  if (zoom === "fit-width") return fitWidthScale;
  if (zoom === "fit-height") return fitHeightScale;
  return zoom;
}
