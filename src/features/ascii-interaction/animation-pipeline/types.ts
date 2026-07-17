import type { ImagePipelineOptions } from "@/features/ascii-interaction/image-pipeline/types";
import type { AsciiMatrix } from "@/features/ascii-interaction/image-pipeline/types";
import type {
  TemporalDebugBuffers,
  TemporalMetrics,
  TemporalPipelineOptions,
} from "@/features/ascii-interaction/animation-pipeline/TemporalPipeline/types";
import { DEFAULT_TEMPORAL_OPTIONS } from "@/features/ascii-interaction/animation-pipeline/TemporalPipeline/types";

export type PlaybackStatus = "stopped" | "playing" | "paused";

export interface RgbaFrame {
  index: number;
  width: number;
  height: number;
  delayMs: number;
  /** RGBA row-major */
  pixels: Uint8ClampedArray;
}

export interface DecodedGif {
  width: number;
  height: number;
  frameCount: number;
  frames: RgbaFrame[];
  loopCount: number;
  totalDurationMs: number;
}

export interface AsciiAnimationFrame {
  index: number;
  matrix: AsciiMatrix;
  delayMs: number;
  /** Optional — generated on demand to save RAM (P1.4). */
  source?: string;
}

export interface AsciiAnimation {
  width: number;
  height: number;
  frameCount: number;
  frames: AsciiAnimationFrame[];
  fps: number;
  loop: boolean;
  frameDelays: number[];
  totalDurationMs: number;
  pipelineOptions: ImagePipelineOptions;
  sourceName: string;
}

export interface AnimationManifest {
  version: 1;
  format: "ascii-animation";
  frameCount: number;
  cols: number;
  rows: number;
  fps: number;
  loop: boolean;
  charset: string;
  colorMode: string;
  pipelineOptions: ImagePipelineOptions;
}

export interface AnimationMetadata {
  sourceName: string;
  sourceType: "image/gif";
  convertedAt: string;
  totalDurationMs: number;
  frameDelays: number[];
  gifWidth: number;
  gifHeight: number;
}

export interface ConversionProgress {
  completed: number;
  total: number;
  percent: number;
  currentFrame: number;
  cancelled: boolean;
}

export interface AnimationPipelineOptions {
  pipeline: ImagePipelineOptions;
  targetFps: number;
  loop: boolean;
  maxFramesInMemory: number;
  workerCount: number;
  /** Temporal ASCII — GIF sequence coherence (forces sequential convert when enabled). */
  temporal: TemporalPipelineOptions;
}

export const DEFAULT_ANIMATION_PIPELINE_OPTIONS: AnimationPipelineOptions = {
  pipeline: {
    width: 100,
    height: 0,
    lockAspectRatio: true,
    pixelAspect: 1,
    fontCompensation: 1,
    brightness: 0,
    contrast: 1,
    gamma: 1,
    exposure: 0,
    sharpness: 0,
    invert: false,
    invertLuminance: false,
    invertColors: false,
    threshold: 0,
    blur: 0,
    edgeEnhance: 0,
    blackPoint: 0,
    midPoint: 0.5,
    whitePoint: 1,
    characterDensity: 1,
    characterBias: 0,
    adaptiveMapping: false,
    charset: " .:-=+*#%@",
    mappingMode: "brightness",
    dithering: "floyd-steinberg",
    colorMode: "root-os",
  },
  targetFps: 15,
  loop: true,
  maxFramesInMemory: 48,
  workerCount: 2,
  temporal: { ...DEFAULT_TEMPORAL_OPTIONS },
};

export type { TemporalDebugBuffers, TemporalMetrics, TemporalPipelineOptions };

export interface TimelineState {
  currentFrame: number;
  currentTimeMs: number;
  totalTimeMs: number;
  status: PlaybackStatus;
  fps: number;
  loop: boolean;
}

export type {
  WorkerBatchResultMessage,
  WorkerCancelMessage,
  WorkerConvertBatchMessage,
  WorkerInboundMessage,
  WorkerOutboundMessage,
  WorkerProgressMessage,
} from "@/features/ascii-interaction/animation-pipeline/workers/worker-protocol";
