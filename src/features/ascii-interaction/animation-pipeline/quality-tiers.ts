import type {
  AnimationPipelineOptions,
  AnimationQualityTier,
  TemporalPipelineOptions,
} from "@/features/ascii-interaction/animation-pipeline/types";
import { DEFAULT_TEMPORAL_OPTIONS } from "@/features/ascii-interaction/animation-pipeline/TemporalPipeline/types";

export type { AnimationQualityTier };

export const ANIMATION_QUALITY_TIERS: {
  id: AnimationQualityTier;
  label: string;
  description: string;
}[] = [
  {
    id: "performance",
    label: "Performance",
    description: "Faster convert — narrower grid, adaptive FPS, lighter temporal stack.",
  },
  {
    id: "balanced",
    label: "Balanced",
    description: "Default quality — full temporal stack, moderate width.",
  },
  {
    id: "maximum",
    label: "Maximum Quality",
    description: "Best fidelity — wider grid, full temporal, no adaptive skip.",
  },
];

/** Apply a quality tier onto current animation options (preserves user charset/colors). */
export function applyAnimationQualityTier(
  tier: AnimationQualityTier,
  current: AnimationPipelineOptions,
): AnimationPipelineOptions {
  const baseTemporal: TemporalPipelineOptions = {
    ...DEFAULT_TEMPORAL_OPTIONS,
    ...current.temporal,
    enabled: true,
  };

  switch (tier) {
    case "performance":
      return {
        ...current,
        qualityTier: "performance",
        pipeline: {
          ...current.pipeline,
          width: Math.min(current.pipeline.width || 80, 72),
          dithering: "ordered",
          adaptiveMapping: false,
        },
        workerCount: Math.max(2, current.workerCount),
        maxFramesInMemory: 32,
        temporal: {
          ...baseTemporal,
          temporalSmoothing: true,
          characterPersistence: true,
          motionDetection: true,
          regionReuse: true,
          temporalDithering: true,
          noiseReduction: false,
          motionSharpen: false,
          adaptiveFps: true,
          roiPriority: false,
        },
      };
    case "maximum":
      return {
        ...current,
        qualityTier: "maximum",
        pipeline: {
          ...current.pipeline,
          width: Math.max(current.pipeline.width || 100, 140),
          dithering: "floyd-steinberg",
          adaptiveMapping: true,
        },
        workerCount: 1,
        maxFramesInMemory: 96,
        temporal: {
          ...baseTemporal,
          temporalSmoothing: true,
          characterPersistence: true,
          motionDetection: true,
          regionReuse: true,
          temporalDithering: true,
          noiseReduction: true,
          motionSharpen: true,
          adaptiveFps: false,
          roiPriority: true,
        },
      };
    case "balanced":
    default:
      return {
        ...current,
        qualityTier: "balanced",
        pipeline: {
          ...current.pipeline,
          width: current.pipeline.width || 100,
          dithering: current.pipeline.dithering || "floyd-steinberg",
        },
        workerCount: Math.max(2, current.workerCount),
        maxFramesInMemory: 48,
        temporal: {
          ...baseTemporal,
          temporalSmoothing: true,
          characterPersistence: true,
          motionDetection: true,
          regionReuse: true,
          temporalDithering: true,
          noiseReduction: true,
          motionSharpen: true,
          adaptiveFps: false,
          roiPriority: false,
        },
      };
  }
}
