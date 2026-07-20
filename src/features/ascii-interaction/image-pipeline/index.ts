export type {
  AsciiMatrix,
  AsciiMatrixCell,
  ColorMode,
  DitheringMode,
  ImagePipelineOptions,
  ImagePipelinePreset,
  MappingMode,
  PipelineBenchmark,
  PipelineResult,
  SupportedImageMime,
} from "@/features/ascii-interaction/image-pipeline/types";

export {
  DEFAULT_IMAGE_PIPELINE_OPTIONS,
  SUPPORTED_IMAGE_MIMES,
} from "@/features/ascii-interaction/image-pipeline/types";

export {
  getImageDimensions,
  isSupportedImageMime,
  loadImageFromClipboardItem,
  loadImageFromFile,
  loadImageElement,
} from "@/features/ascii-interaction/image-pipeline/image-loader";

export {
  applyImageFilters,
  resolveOutputSize,
  sampleImage,
  sobelEdges,
} from "@/features/ascii-interaction/image-pipeline/image-processor";

export { applyDithering } from "@/features/ascii-interaction/image-pipeline/dithering";

export {
  DEFAULT_MATRIX_CELL_H,
  DEFAULT_MATRIX_CELL_W,
  canvasToPngBlob,
  renderMatrixToCanvas,
  renderMatrixToImageData,
  resolveMatrixRenderDimensions,
} from "@/features/ascii-interaction/image-pipeline/render-utils";

export {
  IMAGE_CHARSETS,
  getCharsetInkCoverage,
  mapLuminanceToCharByDensity,
  mapLuminanceToCharIndex,
  resolveCellColor,
} from "@/features/ascii-interaction/image-pipeline/charset-mapper";

export { generateAsciiMatrix } from "@/features/ascii-interaction/image-pipeline/matrix-generator";

export {
  downloadMatrix,
  downloadMatrixPng,
  downloadMatrixZip,
  downloadText,
  copyAsciiToClipboard,
  matrixToAsciiSource,
  matrixToHtml,
  matrixToJson,
  matrixToSvg,
  renderMatrixToPng,
} from "@/features/ascii-interaction/image-pipeline/exporter";
export type { CopyAsciiResult, MatrixExportOptions } from "@/features/ascii-interaction/image-pipeline/exporter";
export type { MatrixRenderOptions } from "@/features/ascii-interaction/image-pipeline/render-utils";

export {
  DEFAULT_CHAR_WEIGHTS,
  applyWeightsToCharset,
  mapLuminanceWithWeights,
  orderCharsetByWeight,
  weightForChar,
  type CharWeightMap,
} from "@/features/ascii-interaction/image-pipeline/char-weights";

export {
  getImagePipelinePreset,
  IMAGE_PIPELINE_PRESETS,
} from "@/features/ascii-interaction/image-pipeline/presets";

export {
  REFINEMENT_PRESETS,
  getRefinementPreset,
  exportPipelineSettingsJson,
  parsePipelineSettingsJson,
} from "@/features/ascii-interaction/image-pipeline/refinement-presets";

export {
  computeLuminanceHistogram,
  autoOptimizeFromBuffer,
} from "@/features/ascii-interaction/image-pipeline/histogram";
export type { LuminanceHistogram } from "@/features/ascii-interaction/image-pipeline/histogram";

export {
  applyCharacterDensity,
  applyAdaptiveLuminance,
} from "@/features/ascii-interaction/image-pipeline/matrix-generator";

export { resampleRgba, runRgbaPipeline, sampleRgba, resolveOutputSizeFromDimensions } from "@/features/ascii-interaction/image-pipeline/rgba-processor";

export { mergePipelineOptions, runImagePipeline, withResolvedGlyphMetrics } from "@/features/ascii-interaction/image-pipeline/pipeline";

export {
  runImagePipelineAsync,
  sampleImagePixels,
  destroyImageWorker,
} from "@/features/ascii-interaction/image-pipeline/workers/image-worker-client";
