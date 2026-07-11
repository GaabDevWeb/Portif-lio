import { getImageDimensions } from "@/features/ascii-interaction/image-pipeline/image-loader";
import {
  applyImageFilters,
  resolveOutputSize,
  sampleImage,
} from "@/features/ascii-interaction/image-pipeline/image-processor";
import { generateAsciiMatrix } from "@/features/ascii-interaction/image-pipeline/matrix-generator";
import { matrixToAsciiSource } from "@/features/ascii-interaction/image-pipeline/exporter";
import type { ImagePipelineOptions, PipelineResult } from "@/features/ascii-interaction/image-pipeline/types";
import { AspectRatioEngine } from "@/features/ascii-interaction/geometry";

/** Ensure glyph metrics are present so workers/Node share the same geometry as preview. */
export function withResolvedGlyphMetrics(options: ImagePipelineOptions): ImagePipelineOptions {
  if (
    options.glyphCellWidth != null &&
    options.glyphCellHeight != null &&
    options.glyphCellWidth > 0 &&
    options.glyphCellHeight > 0
  ) {
    return options;
  }
  const metrics = AspectRatioEngine.getDefaultGlyphMetrics();
  return {
    ...options,
    glyphCellWidth: metrics.cellWidth,
    glyphCellHeight: metrics.cellHeight,
  };
}

export function runImagePipeline(
  image: HTMLImageElement,
  options: ImagePipelineOptions,
): PipelineResult {
  const start = performance.now();
  const resolved = withResolvedGlyphMetrics(options);
  const { width: imgW, height: imgH } = getImageDimensions(image);
  const { width, height } = resolveOutputSize(imgW, imgH, resolved);

  const sampled = sampleImage(image, width, height);
  const filtered = applyImageFilters(sampled, resolved);
  const matrix = generateAsciiMatrix(filtered, resolved);
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
  return withResolvedGlyphMetrics({ ...base, ...partial });
}
