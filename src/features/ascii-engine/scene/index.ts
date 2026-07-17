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

/** Wave 2 — camera + workspace stubs */
export {
  screenToWorld,
  worldToScreen,
  worldToCell,
  panCamera,
  panCameraByScreen,
  zoomCamera,
  zoomAtScreen,
  fitCameraToBounds,
  sceneContentBounds,
  cameraWorldTransform,
  clampZoom,
  MIN_CAMERA_ZOOM,
  MAX_CAMERA_ZOOM,
  type CellSize,
  type ViewportSize,
  type WorldPoint,
  type ScreenPoint,
  type SceneBoundsRect,
} from "@/features/ascii-engine/scene/camera";
export {
  createRulersStub,
  type RulersController,
  type RulerTick,
  type RulersSource,
} from "@/features/ascii-engine/scene/rulers";
export {
  createGuidesStub,
  type GuidesController,
  type Guide,
  type GuideOrientation,
} from "@/features/ascii-engine/scene/guides";
export {
  createSnappingStub,
  type SnappingController,
  type SnapResult,
  type SnapTarget,
} from "@/features/ascii-engine/scene/snapping";
export {
  createMiniMapStub,
  type MiniMapController,
  type MiniMapSource,
  type MiniMapBounds,
} from "@/features/ascii-engine/scene/minimap";

/** Wave 5 — shapes / text / stamp */
export {
  createShapeSpec,
  ShapeBuilders,
  addShapeToScene,
  type ShapeCreateOptions,
  type ShapeSpec,
} from "@/features/ascii-engine/scene/shapes";
export {
  measurePlainText,
  createTextPayload,
  addTextToScene,
  TEXT_FONT_MODES,
  type TextCreateOptions,
} from "@/features/ascii-engine/scene/text";
export {
  StampLibrary,
  extractMatrixRegion,
  extractStampFromScene,
  extractStampFromImageObject,
  stampRegionIntoScene,
  placeStampAsset,
  countNonEmptyCells,
  type StampRegion,
  type StampAsset,
  type StampIntoSceneOptions,
} from "@/features/ascii-engine/scene/stamp";

/** Wave 6 — effects */
export {
  createEffect,
  EffectFactories,
  effectBoundsPadding,
  expandBoundsForEffects,
  EFFECT_STATUS,
} from "@/features/ascii-engine/scene/effects";

/** Wave 7 — clipboard / export */
export {
  SceneClipboard,
  serializeSceneObjects,
  deserializeSceneObjects,
  type SceneClipboardPayload,
} from "@/features/ascii-engine/scene/clipboard";
export {
  exportSceneCompositeMatrix,
  exportSceneCompositeTxt,
  exportSceneCompositeJson,
  exportSceneComposite,
  type ExportSceneOptions,
} from "@/features/ascii-engine/scene/export";
