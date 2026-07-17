import type { AsciiMatrix } from "@/features/ascii-interaction/image-pipeline/types";
import type { AsciiAnimation } from "@/features/ascii-interaction/animation-pipeline/types";
import type { ImagePipelineOptions } from "@/features/ascii-interaction/image-pipeline/types";
import {
  DEFAULT_IMAGE_PIPELINE_OPTIONS,
  isSupportedImageMime,
  loadImageElement,
  loadImageFromClipboardItem,
  loadImageFromFile,
  mergePipelineOptions,
  runImagePipeline,
} from "@/features/ascii-interaction/image-pipeline";

import type {
  ConversionProgressInfo,
  ConverterCapability,
  SourceAdapter,
} from "@/features/ascii-engine/converters/types";

function isClipboardItem(input: unknown): input is ClipboardItem {
  return typeof ClipboardItem !== "undefined" && input instanceof ClipboardItem;
}

function isImageFile(input: unknown): input is File {
  return (
    typeof File !== "undefined" &&
    input instanceof File &&
    (isSupportedImageMime(input.type) ||
      /\.(png|jpe?g|webp)$/i.test(input.name) ||
      input.type.startsWith("image/"))
  );
}

/**
 * Clipboard → ASCII: ClipboardItem / File de imagem → image-pipeline.
 * Não lê navigator.clipboard.read() sozinho (precisa de gesto do utilizador);
 * a UI passa o item/file obtido no paste.
 */
export class ClipboardAdapter implements SourceAdapter {
  readonly kind = "clipboard" as const;
  readonly capability: ConverterCapability = {
    kind: "clipboard",
    label: "Clipboard",
    status: "ready",
    mimeTypes: ["image/png", "image/jpeg", "image/webp"],
    description: "Paste image (ClipboardItem / File) → AsciiMatrix via image-pipeline.",
  };

  canHandle(input: unknown): boolean {
    return isClipboardItem(input) || isImageFile(input);
  }

  async convert(
    input: unknown,
    options: Partial<ImagePipelineOptions>,
    onProgress?: (p: ConversionProgressInfo) => void,
  ): Promise<{ matrix?: AsciiMatrix; animation?: AsciiAnimation }> {
    if (!this.canHandle(input)) {
      throw new Error("ClipboardAdapter espera ClipboardItem ou File de imagem.");
    }

    onProgress?.({ completed: 0, total: 2, percent: 0 });

    let image: HTMLImageElement | null = null;

    if (isClipboardItem(input)) {
      image = await loadImageFromClipboardItem(input);
      if (!image) {
        // Fallback: primeiro tipo image/*
        for (const type of input.types) {
          if (!type.startsWith("image/")) continue;
          const blob = await input.getType(type);
          image = await loadImageElement(blob);
          break;
        }
      }
    } else if (isImageFile(input)) {
      if (isSupportedImageMime(input.type)) {
        image = await loadImageFromFile(input);
      } else {
        image = await loadImageElement(input);
      }
    }

    if (!image) {
      throw new Error("Clipboard sem imagem suportada (PNG/JPEG/WEBP).");
    }

    onProgress?.({ completed: 1, total: 2, percent: 50 });

    const result = runImagePipeline(
      image,
      mergePipelineOptions(DEFAULT_IMAGE_PIPELINE_OPTIONS, options),
    );
    onProgress?.({ completed: 2, total: 2, percent: 100 });

    return { matrix: result.matrix };
  }
}

/** Lê clipboard do browser (requer permissão + gesto) e devolve o primeiro ClipboardItem com imagem. */
export async function readClipboardImageItem(): Promise<ClipboardItem | null> {
  if (typeof navigator === "undefined" || !navigator.clipboard?.read) {
    return null;
  }
  try {
    const items = await navigator.clipboard.read();
    for (const item of items) {
      if (item.types.some((t) => t.startsWith("image/"))) return item;
    }
    return null;
  } catch {
    return null;
  }
}
