/**
 * Temporal ASCII options — GIF sequence coherence (independent of still-image pipeline).
 */

export interface TemporalPipelineOptions {
  /** Master switch — when false, classic per-frame convert. */
  enabled: boolean;
  temporalSmoothing: boolean;
  /** Blend factor toward previous luminance (0…1). */
  smoothingStrength: number;
  characterPersistence: boolean;
  /** Hysteresis band in luminance units (0…0.5). */
  persistenceBand: number;
  motionDetection: boolean;
  /** Mean abs luminance delta above this = motion (0…1). */
  motionThreshold: number;
  regionReuse: boolean;
  temporalDithering: boolean;
  noiseReduction: boolean;
  /** Box blur radius in samples for temporal noise (0…2). */
  noiseStrength: number;
  motionSharpen: boolean;
  motionSharpenAmount: number;
  adaptiveFps: boolean;
  /** Skip frame if motion fraction below this (0…1). */
  adaptiveSimilarity: number;
  roiPriority: boolean;
  /** Center ROI radius as fraction of min(cols,rows) (0.2…0.8). */
  roiRadius: number;
  keyframeInterval: number;
}

export const DEFAULT_TEMPORAL_OPTIONS: TemporalPipelineOptions = {
  enabled: true,
  temporalSmoothing: true,
  smoothingStrength: 0.35,
  characterPersistence: true,
  persistenceBand: 0.06,
  motionDetection: true,
  motionThreshold: 0.04,
  regionReuse: true,
  temporalDithering: true,
  noiseReduction: true,
  noiseStrength: 0.6,
  motionSharpen: true,
  motionSharpenAmount: 0.35,
  adaptiveFps: false,
  adaptiveSimilarity: 0.015,
  roiPriority: false,
  roiRadius: 0.4,
  keyframeInterval: 12,
};

export interface MotionMap {
  width: number;
  height: number;
  /** 0 = static, 1 = moving */
  mask: Float32Array;
  motionFraction: number;
}

export interface TemporalMetrics {
  frames: number;
  motionPercent: number;
  blocksReused: number;
  charactersUpdated: number;
  framesSkipped: number;
  temporalStability: number;
  processingTimeMs: number;
  peakHeapMb: number | null;
}

export interface TemporalDebugBuffers {
  motionMap: MotionMap | null;
  /** Previous smoothed luminance (temporal buffer). */
  temporalBuffer: Float32Array | null;
  cols: number;
  rows: number;
}

export interface TemporalFrameState {
  prevLuminance: Float32Array | null;
  prevSmoothed: Float32Array | null;
  prevMatrix: import("@/features/ascii-interaction/image-pipeline/types").AsciiMatrix | null;
  prevCharIndex: Int16Array | null;
  frameIndex: number;
  metrics: TemporalMetrics;
  lastKeyframe: number;
  debug: TemporalDebugBuffers;
}

export function createEmptyTemporalMetrics(): TemporalMetrics {
  return {
    frames: 0,
    motionPercent: 0,
    blocksReused: 0,
    charactersUpdated: 0,
    framesSkipped: 0,
    temporalStability: 1,
    processingTimeMs: 0,
    peakHeapMb: null,
  };
}

export function createTemporalState(): TemporalFrameState {
  return {
    prevLuminance: null,
    prevSmoothed: null,
    prevMatrix: null,
    prevCharIndex: null,
    frameIndex: 0,
    metrics: createEmptyTemporalMetrics(),
    lastKeyframe: 0,
    debug: { motionMap: null, temporalBuffer: null, cols: 0, rows: 0 },
  };
}

export const TEMPORAL_FEATURE_META: {
  id:
    | "temporalSmoothing"
    | "characterPersistence"
    | "motionDetection"
    | "regionReuse"
    | "temporalDithering"
    | "noiseReduction"
    | "motionSharpen"
    | "adaptiveFps"
    | "roiPriority";
  label: string;
  description: string;
}[] = [
  {
    id: "temporalSmoothing",
    label: "Temporal Smoothing",
    description: "Blend luminance with neighbouring frames to kill micro-flicker.",
  },
  {
    id: "characterPersistence",
    label: "Character Persistence",
    description: "Hysteresis: keep the same glyph until luminance exits its band.",
  },
  {
    id: "motionDetection",
    label: "Motion Detection",
    description: "Build a motion map so only changing regions are rebuilt.",
  },
  {
    id: "regionReuse",
    label: "Region Reuse",
    description: "Copy static ASCII cells from the previous frame verbatim.",
  },
  {
    id: "temporalDithering",
    label: "Temporal Dithering",
    description: "Stable dither pattern on static areas — no snow/chuvisco.",
  },
  {
    id: "noiseReduction",
    label: "Noise Reduction",
    description: "Light denoise before convert — fights GIF compression artefacts.",
  },
  {
    id: "motionSharpen",
    label: "Motion Sharpen",
    description: "Sharpen only moving regions; leave static areas untouched.",
  },
  {
    id: "adaptiveFps",
    label: "Adaptive FPS",
    description: "Skip near-duplicate frames while preserving playback delays.",
  },
  {
    id: "roiPriority",
    label: "ROI Priority",
    description: "Prefer detail in the centre; soft periphery (faces/subjects).",
  },
];
