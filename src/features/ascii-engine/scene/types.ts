import type { AsciiMatrix } from "@/features/ascii-interaction/image-pipeline/types";

export type SceneObjectType =
  | "image"
  | "text"
  | "shape"
  | "stroke"
  | "group"
  | "reference";

export type BlendMode = "normal" | "multiply" | "screen" | "overlay" | "mask";

export type EffectKind =
  | "glow"
  | "shadow"
  | "outline"
  | "noise"
  | "crt"
  | "scanline"
  | "invert"
  | "posterize"
  | "colorize";

export interface EffectRef {
  id: string;
  kind: EffectKind;
  enabled: boolean;
  params: Record<string, number | string | boolean>;
}

export interface SceneTransform {
  /** World position in cells (top-left of object). */
  x: number;
  y: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
}

export interface SceneBounds {
  w: number;
  h: number;
}

export interface SceneObjectBase {
  id: string;
  name: string;
  layerId: string;
  transform: SceneTransform;
  bounds: SceneBounds;
  visible: boolean;
  locked: boolean;
  opacity: number;
  blendMode: BlendMode;
  effects: EffectRef[];
}

export interface ImageObjectData {
  matrix: AsciiMatrix;
  sourceAssetId?: string;
}

export interface TextObjectData {
  text: string;
  charset?: string;
  color?: { r: number; g: number; b: number };
  align: "left" | "center" | "right";
  lineHeight: number;
  /** Simple baked font vs future FIGlet. */
  fontMode: "plain" | "figlet-stub";
}

export type ShapeKind = "line" | "rect" | "round-rect" | "circle" | "ellipse" | "polygon" | "arrow";

export interface ShapeObjectData {
  shape: ShapeKind;
  char: string;
  fill: boolean;
  strokeWidth: number;
  color?: { r: number; g: number; b: number };
  points?: Array<{ x: number; y: number }>;
}

export interface StrokePoint {
  x: number;
  y: number;
  pressure?: number;
}

export interface StrokeObjectData {
  brushPresetId: string;
  points: StrokePoint[];
  /** Baked cells for fast compose (updated on stroke end). */
  baked?: AsciiMatrix | null;
}

export interface GroupObjectData {
  childIds: string[];
}

export interface ReferenceObjectData {
  assetId: string;
  libraryId: string;
}

export type SceneObjectData =
  | { type: "image"; payload: ImageObjectData }
  | { type: "text"; payload: TextObjectData }
  | { type: "shape"; payload: ShapeObjectData }
  | { type: "stroke"; payload: StrokeObjectData }
  | { type: "group"; payload: GroupObjectData }
  | { type: "reference"; payload: ReferenceObjectData };

export type SceneObject = SceneObjectBase & SceneObjectData;

export interface SceneLayer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  blendMode: BlendMode;
  mask: AsciiMatrix | null;
  /** Z-order bottom → top. */
  objectIds: string[];
}

export interface SceneCameraState {
  x: number;
  y: number;
  zoom: number;
  showGrid: boolean;
  snapEnabled: boolean;
}

export interface SceneHistoryCheckpoint {
  id: string;
  label: string;
  createdAt: string;
  /** Serialized scene snapshot. */
  snapshot: SceneDocumentData;
}

export interface SceneHistoryBranchStub {
  id: string;
  name: string;
  headCheckpointId: string | null;
}

export interface SceneDocumentData {
  version: "1.0";
  width: number;
  height: number;
  layers: SceneLayer[];
  objects: Record<string, SceneObject>;
  activeLayerId: string;
  selectedObjectIds: string[];
  camera: SceneCameraState;
  checkpoints: SceneHistoryCheckpoint[];
  historyBranches: SceneHistoryBranchStub[];
}

export const DEFAULT_SCENE_CAMERA: SceneCameraState = {
  x: 0,
  y: 0,
  zoom: 1,
  showGrid: true,
  snapEnabled: true,
};

export function createEmptyScene(width = 80, height = 40): SceneDocumentData {
  const layerId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `layer-${Date.now()}`;
  return {
    version: "1.0",
    width,
    height,
    layers: [
      {
        id: layerId,
        name: "Layer 1",
        visible: true,
        locked: false,
        opacity: 1,
        blendMode: "normal",
        mask: null,
        objectIds: [],
      },
    ],
    objects: {},
    activeLayerId: layerId,
    selectedObjectIds: [],
    camera: { ...DEFAULT_SCENE_CAMERA },
    checkpoints: [],
    historyBranches: [],
  };
}
