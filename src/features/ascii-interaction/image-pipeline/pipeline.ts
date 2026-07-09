import { getImageDimensions } from "@/features/ascii-interaction/image-pipeline/image-loader";
import {
  applyImageFilters,
  resolveOutputSize,
  sampleImage,
} from "@/features/ascii-interaction/image-pipeline/image-processor";
import { generateAsciiMatrix } from "@/features/ascii-interaction/image-pipeline/matrix-generator";
import { matrixToAsciiSource } from "@/features/ascii-interaction/image-pipeline/exporter";
import type { ImagePipelineOptions, PipelineResult } from "@/features/ascii-interaction/image-pipeline/types";

export function runImagePipeline(
  image: HTMLImageElement,
  options: ImagePipelineOptions,
): PipelineResult {
  const start = performance.now();
  const { width: imgW, height: imgH } = getImageDimensions(image);
  const { width, height } = resolveOutputSize(imgW, imgH, options);

  const sampled = sampleImage(image, width, height);
  const filtered = applyImageFilters(sampled, options);
  const matrix = generateAsciiMatrix(filtered, options);
  const source = matrixToAsciiSource(matrix);

  const conversionMs = performance.now() - start;

  return {
    matrix,
    source,
    previewDataUrl: image.src.startsWith("data:") || image.src.startsWith("blob:")
      ? image.src
      : null,
    sourceWidth: imgW,
    sourceHeight: imgH,
    benchmark: {
      conversionMs,
      characterCount: matrix.cells.length,
      cols: matrix.cols,
      rows: matrix.rows,
    },
  };
}

export function mergePipelineOptions(
  base: ImagePipelineOptions,
  partial?: Partial<ImagePipelineOptions>,
): ImagePipelineOptions {
  return { ...base, ...partial };
}
