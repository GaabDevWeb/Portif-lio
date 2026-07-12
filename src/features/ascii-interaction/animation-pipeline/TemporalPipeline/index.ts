export type {
  MotionMap,
  TemporalDebugBuffers,
  TemporalFrameState,
  TemporalMetrics,
  TemporalPipelineOptions,
} from "@/features/ascii-interaction/animation-pipeline/TemporalPipeline/types";

export {
  DEFAULT_TEMPORAL_OPTIONS,
  TEMPORAL_FEATURE_META,
  createEmptyTemporalMetrics,
  createTemporalState,
} from "@/features/ascii-interaction/animation-pipeline/TemporalPipeline/types";

export { detectMotion } from "@/features/ascii-interaction/animation-pipeline/TemporalPipeline/MotionDetector";
export { applyCharacterPersistence } from "@/features/ascii-interaction/animation-pipeline/TemporalPipeline/CharacterPersistence";
export { applyTemporalDither } from "@/features/ascii-interaction/animation-pipeline/TemporalPipeline/TemporalDither";
export { smoothTemporal } from "@/features/ascii-interaction/animation-pipeline/TemporalPipeline/TemporalSmoothing";
export { reduceNoise } from "@/features/ascii-interaction/animation-pipeline/TemporalPipeline/NoiseReducer";
export { motionSharpen } from "@/features/ascii-interaction/animation-pipeline/TemporalPipeline/MotionSharpen";
export { reuseStaticRegions } from "@/features/ascii-interaction/animation-pipeline/TemporalPipeline/RegionReuse";
export { shouldSkipFrame } from "@/features/ascii-interaction/animation-pipeline/TemporalPipeline/AdaptiveFPS";
export { isKeyframe, KeyframeManager } from "@/features/ascii-interaction/animation-pipeline/TemporalPipeline/KeyframeManager";
export { applyRoiBias } from "@/features/ascii-interaction/animation-pipeline/TemporalPipeline/RegionOfInterest";
export {
  TemporalConverter,
  convertRgbaFramesTemporal,
} from "@/features/ascii-interaction/animation-pipeline/TemporalPipeline/TemporalConverter";
