import type { BrushEngine } from "@/features/ascii-engine/brush/engine";
import type { SceneDocument } from "@/features/ascii-engine/scene/scene-document";
import type { SceneHistory } from "@/features/ascii-engine/scene/history";
import type { SceneCameraState } from "@/features/ascii-engine/scene/types";
import type { SelectionModel } from "@/features/ascii-engine/tools/selection";
import type { CellSize, ViewportSize, WorldPoint } from "@/features/ascii-engine/scene/camera";
import type { AsciiMatrix } from "@/features/ascii-interaction/image-pipeline/types";

export interface PointerWorld {
  /** Fractional world cell coords. */
  world: WorldPoint;
  col: number;
  row: number;
  screenX: number;
  screenY: number;
  pressure: number;
  buttons: number;
  shiftKey: boolean;
  altKey: boolean;
  metaKey: boolean;
}

/** Scene editor tool context (distinct from legacy editor ToolContext). */
export interface SceneToolContext {
  scene: SceneDocument;
  selection: SelectionModel;
  camera: SceneCameraState;
  setCamera: (patch: Partial<SceneCameraState>) => void;
  brush: BrushEngine;
  history: SceneHistory;
  pointer: PointerWorld;
  viewport: ViewportSize;
  cellSize: CellSize;
  /** Notify UI to re-render after mutations. */
  requestRender: () => void;
  getStrokeBuffer: () => AsciiMatrix | null;
  setStrokeBuffer: (matrix: AsciiMatrix | null) => void;
}

export interface SceneTool {
  id: string;
  label: string;
  cursor: string;
  onPointerDown?(ctx: SceneToolContext, ev: PointerWorld): void;
  onPointerMove?(ctx: SceneToolContext, ev: PointerWorld): void;
  onPointerUp?(ctx: SceneToolContext, ev: PointerWorld): void;
  onKeyDown?(
    ctx: SceneToolContext,
    key: string,
    ev: { shiftKey: boolean; altKey: boolean },
  ): void;
}
