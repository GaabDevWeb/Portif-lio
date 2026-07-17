import type { AsciiMatrix } from "@/features/ascii-interaction/image-pipeline/types";
import type { AsciiAnimation } from "@/features/ascii-interaction/animation-pipeline/types";
import type { ImagePipelineOptions } from "@/features/ascii-interaction/image-pipeline/types";
import {
  DEFAULT_IMAGE_PIPELINE_OPTIONS,
  mergePipelineOptions,
  runImagePipeline,
} from "@/features/ascii-interaction/image-pipeline";

import type {
  ConversionProgressInfo,
  ConverterCapability,
  SourceAdapter,
} from "@/features/ascii-engine/converters/types";
import {
  canHandleSvgInput,
  isSvgBlob,
  isSvgFile,
  isSvgMarkup,
  rasterizeSvgToImage,
} from "@/features/ascii-engine/converters/rasterize-svg";

export class SvgAdapter implements SourceAdapter {
  readonly kind = "svg" as const;
  readonly capability: ConverterCapability = {
    kind: "svg",
    label: "SVG",
    status: "ready",
    mimeTypes: ["image/svg+xml"],
    description: "SVG → raster (canvas) → AsciiMatrix via image-pipeline.",
  };

  canHandle(input: unknown): boolean {
    return canHandleSvgInput(input);
  }

  async convert(
    input: unknown,
    options: Partial<ImagePipelineOptions>,
    onProgress?: (p: ConversionProgressInfo) => void,
  ): Promise<{ matrix?: AsciiMatrix; animation?: AsciiAnimation }> {
    if (!this.canHandle(input)) {
      throw new Error("SvgAdapter espera File/Blob .svg ou markup SVG.");
    }

    onProgress?.({ completed: 0, total: 2, percent: 0 });

    let source: File | Blob | string;
    if (isSvgFile(input) || isSvgBlob(input)) {
      source = input as File | Blob;
    } else if (isSvgMarkup(input)) {
      source = input as string;
    } else {
      throw new Error("SvgAdapter: input SVG inválido.");
    }

    const image = await rasterizeSvgToImage(source);
    onProgress?.({ completed: 1, total: 2, percent: 50 });

    const result = runImagePipeline(
      image,
      mergePipelineOptions(DEFAULT_IMAGE_PIPELINE_OPTIONS, options),
    );
    onProgress?.({ completed: 2, total: 2, percent: 100 });

    return { matrix: result.matrix };
  }
}

/** Carrega SVG e devolve HTMLImageElement rasterizado (para UI Convert). */
export async function loadSvgAsImage(file: File): Promise<HTMLImageElement> {
  if (!isSvgFile(file)) {
    throw new Error(`Formato não suportado: ${file.type || file.name || "desconhecido"}`);
  }
  return rasterizeSvgToImage(file);
}
