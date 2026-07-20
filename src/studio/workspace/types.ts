export type ZoomPreset =
  | "fit"
  | "fit-width"
  | "fit-height"
  | 0.25
  | 0.5
  | 1
  | 2
  | 4
  | 8;

export type OriginalViewMode = "split" | "overlay" | "peek" | "wipe";

export interface WorkspacePan {
  x: number;
  y: number;
}

export interface WorkspaceState {
  zoom: ZoomPreset;
  pan: WorkspacePan;
  showOriginal: boolean;
  originalMode: OriginalViewMode;
  /** 0 = full ASCII, 1 = full original (wipe mode). */
  wipePosition: number;
  focusMode: boolean;
  peeking: boolean;
  sidebarOpen: boolean;
  fullscreen: boolean;
}

/** Chips shown in toolbar (incl. Fit + percentages + original-ish 100%). */
export const ZOOM_PRESETS: readonly ZoomPreset[] = [
  "fit",
  0.25,
  0.5,
  1,
  2,
  4,
] as const;

/** Order used by zoomIn / zoomOut. */
export const ZOOM_CYCLE: readonly ZoomPreset[] = [
  "fit",
  0.25,
  0.5,
  1,
  2,
  4,
  8,
] as const;

export const DEFAULT_WORKSPACE_STATE: WorkspaceState = {
  zoom: "fit",
  pan: { x: 0, y: 0 },
  showOriginal: false,
  originalMode: "wipe",
  wipePosition: 0.5,
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

/** UI label for zoom chip. */
export function zoomPresetLabel(zoom: ZoomPreset): string {
  if (zoom === "fit") return "Fit";
  if (zoom === "fit-width") return "Fit W";
  if (zoom === "fit-height") return "Fit H";
  if (zoom === 0.25) return "25%";
  if (zoom === 0.5) return "50%";
  if (zoom === 1) return "100%";
  if (zoom === 2) return "200%";
  if (zoom === 4) return "400%";
  if (zoom === 8) return "800%";
  return String(zoom);
}
