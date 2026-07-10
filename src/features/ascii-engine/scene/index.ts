export type {
  SceneObjectType,
  BlendMode,
  EffectKind,
  EffectRef,
  SceneTransform,
  SceneBounds,
  SceneObjectBase,
  ImageObjectData,
  TextObjectData,
  ShapeKind,
  ShapeObjectData,
  StrokePoint,
  StrokeObjectData,
  GroupObjectData,
  ReferenceObjectData,
  SceneObjectData,
  SceneObject,
  SceneLayer,
  SceneCameraState,
  SceneHistoryCheckpoint,
  SceneHistoryBranchStub,
  SceneDocumentData,
} from "@/features/ascii-engine/scene/types";
export { DEFAULT_SCENE_CAMERA, createEmptyScene } from "@/features/ascii-engine/scene/types";
export { SceneDocument, emptyMatrix } from "@/features/ascii-engine/scene/scene-document";
export {
  composeScene,
  SceneCompositorCache,
  type ComposeOptions,
} from "@/features/ascii-engine/scene/compositor";
export {
  SceneHistory,
  SceneSnapshotCommand,
  runWithHistory,
  type SceneCommand,
} from "@/features/ascii-engine/scene/history";
