export type ZoomPreset = "fit" | 1 | 2 | 4 | 8;

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
}

export const ZOOM_PRESETS: readonly ZoomPreset[] = ["fit", 1, 2, 4, 8] as const;

export const DEFAULT_WORKSPACE_STATE: WorkspaceState = {
  zoom: "fit",
  pan: { x: 0, y: 0 },
  showOriginal: false,
  originalMode: "peek",
  focusMode: false,
  peeking: false,
  sidebarOpen: false,
};

export function zoomToScale(zoom: ZoomPreset, fitScale: number): number {
  if (zoom === "fit") return fitScale;
  return zoom;
}
