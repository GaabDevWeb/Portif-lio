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
  IMAGE_CHARSETS,
  mapLuminanceToCharIndex,
  resolveCellColor,
} from "@/features/ascii-interaction/image-pipeline/charset-mapper";

export { generateAsciiMatrix } from "@/features/ascii-interaction/image-pipeline/matrix-generator";

export {
  downloadMatrix,
  downloadMatrixPng,
  downloadText,
  copyAsciiToClipboard,
  matrixToAsciiSource,
  matrixToHtml,
  matrixToJson,
  matrixToSvg,
  renderMatrixToPng,
} from "@/features/ascii-interaction/image-pipeline/exporter";
export type { CopyAsciiResult, MatrixExportOptions } from "@/features/ascii-interaction/image-pipeline/exporter";
export {
  renderMatrixToCanvas,
  renderMatrixToImageData,
  resolveMatrixRenderDimensions,
} from "@/features/ascii-interaction/image-pipeline/render-utils";
export type { MatrixRenderOptions } from "@/features/ascii-interaction/image-pipeline/render-utils";

export {
  getImagePipelinePreset,
  IMAGE_PIPELINE_PRESETS,
} from "@/features/ascii-interaction/image-pipeline/presets";

export { runRgbaPipeline, sampleRgba, resolveOutputSizeFromDimensions } from "@/features/ascii-interaction/image-pipeline/rgba-processor";

export { mergePipelineOptions, runImagePipeline } from "@/features/ascii-interaction/image-pipeline/pipeline";
