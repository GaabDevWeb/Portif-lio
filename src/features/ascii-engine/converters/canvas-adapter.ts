import type { AsciiMatrix } from "@/features/ascii-interaction/image-pipeline/types";
import type { AsciiAnimation } from "@/features/ascii-interaction/animation-pipeline/types";
import type { ImagePipelineOptions } from "@/features/ascii-interaction/image-pipeline/types";
import {
  DEFAULT_IMAGE_PIPELINE_OPTIONS,
  loadImageElement,
  mergePipelineOptions,
  runImagePipeline,
} from "@/features/ascii-interaction/image-pipeline";
import { canvasToPngBlob } from "@/features/ascii-interaction/image-pipeline/render-utils";

import type {
  ConversionProgressInfo,
  ConverterCapability,
  SourceAdapter,
} from "@/features/ascii-engine/converters/types";

function isCanvas(input: unknown): input is HTMLCanvasElement {
  return typeof HTMLCanvasElement !== "undefined" && input instanceof HTMLCanvasElement;
}

/** HTMLCanvasElement → PNG blob → Image → AsciiMatrix. */
export class CanvasAdapter implements SourceAdapter {
  readonly kind = "canvas" as const;
  readonly capability: ConverterCapability = {
    kind: "canvas",
    label: "Canvas",
    status: "ready",
    mimeTypes: [],
    description: "HTMLCanvasElement → raster PNG → AsciiMatrix via image-pipeline.",
  };

  canHandle(input: unknown): boolean {
    return isCanvas(input);
  }

  async convert(
    input: unknown,
    options: Partial<ImagePipelineOptions>,
    onProgress?: (p: ConversionProgressInfo) => void,
  ): Promise<{ matrix?: AsciiMatrix; animation?: AsciiAnimation }> {
    if (!isCanvas(input)) {
      throw new Error("CanvasAdapter espera HTMLCanvasElement.");
    }
    if (input.width < 1 || input.height < 1) {
      throw new Error("Canvas vazio (width/height = 0).");
    }

    onProgress?.({ completed: 0, total: 2, percent: 0 });

    const blob = await canvasToPngBlob(input);
    const image = await loadImageElement(blob);
    onProgress?.({ completed: 1, total: 2, percent: 50 });

    const result = runImagePipeline(
      image,
      mergePipelineOptions(DEFAULT_IMAGE_PIPELINE_OPTIONS, options),
    );
    onProgress?.({ completed: 2, total: 2, percent: 100 });

    return { matrix: result.matrix };
  }
}
