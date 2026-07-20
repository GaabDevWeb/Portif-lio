export * from "@/features/ascii-interaction/animation-pipeline/types";
export { decodeGifBuffer, decodeGifFile } from "@/features/ascii-interaction/animation-pipeline/decoder/gif-decoder";
export { decodeWebpBuffer, decodeWebpFile } from "@/features/ascii-interaction/animation-pipeline/decoder/webp-decoder";
export {
  decodeAnimationFile,
  decodeAnimationBuffer,
  detectAnimationSourceKind,
} from "@/features/ascii-interaction/animation-pipeline/decoder/animation-decoder";
export {
  applyAnimationQualityTier,
  ANIMATION_QUALITY_TIERS,
  type AnimationQualityTier,
} from "@/features/ascii-interaction/animation-pipeline/quality-tiers";
export { extractFrames, summarizeGif } from "@/features/ascii-interaction/animation-pipeline/frame-extractor/frame-extractor";
export {
  convertRgbaFrameToMatrix,
  convertRgbaFrameToAnimationFrame,
  convertRgbaFramesBatch,
} from "@/features/ascii-interaction/animation-pipeline/converter/frame-converter";
export { FrameCache, hashPipelineOptions } from "@/features/ascii-interaction/animation-pipeline/cache/frame-cache";
export { Timeline } from "@/features/ascii-interaction/animation-pipeline/timeline/timeline";
export { PlaybackController } from "@/features/ascii-interaction/animation-pipeline/playback/playback-controller";
export {
  exportAsciiAnimationZip,
  downloadAsciiAnimationZip,
} from "@/features/ascii-interaction/animation-pipeline/exporter/animation-exporter";
export {
  exportAsciiAnimationGif,
  downloadAsciiAnimationGif,
} from "@/features/ascii-interaction/animation-pipeline/exporter/gif-exporter";
export {
  exportAsciiAnimationTxtSequence,
  downloadAsciiAnimationTxtSequence,
} from "@/features/ascii-interaction/animation-pipeline/exporter/txt-sequence-exporter";
export { importAsciiAnimationZip } from "@/features/ascii-interaction/animation-pipeline/importer/animation-importer";
export { AnimationPipeline } from "@/features/ascii-interaction/animation-pipeline/pipeline/animation-pipeline";
export { AnimationFrameRenderer } from "@/features/ascii-interaction/animation-pipeline/renderer/animation-frame-renderer";
export { createAnimationUiState } from "@/features/ascii-interaction/animation-pipeline/state/animation-state";
export {
  TemporalConverter,
  convertRgbaFramesTemporal,
  DEFAULT_TEMPORAL_OPTIONS,
  TEMPORAL_FEATURE_META,
  createEmptyTemporalMetrics,
} from "@/features/ascii-interaction/animation-pipeline/TemporalPipeline";

export {
  frameIndexAtTime,
  formatTimeMs,
  padFrameIndex,
  timeAtFrame,
  totalDuration,
} from "@/features/ascii-interaction/animation-pipeline/utilities/timing";
export { downloadBlob, readFileAsArrayBuffer } from "@/features/ascii-interaction/animation-pipeline/utilities/zip";
export type {
  WorkerBatchResultMessage,
  WorkerCancelMessage,
  WorkerConvertBatchMessage,
  WorkerInboundMessage,
  WorkerOutboundMessage,
  WorkerProgressMessage,
} from "@/features/ascii-interaction/animation-pipeline/workers/worker-protocol";
