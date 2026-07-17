import { SUPPORTED_IMAGE_MIMES, type SupportedImageMime } from "@/features/ascii-interaction/image-pipeline/types";

export function isSupportedImageMime(mime: string): mime is SupportedImageMime {
  return (SUPPORTED_IMAGE_MIMES as readonly string[]).includes(mime);
}

export function loadImageElement(source: Blob | string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";

    const url = typeof source === "string" ? source : URL.createObjectURL(source);

    img.onload = () => {
      if (typeof source !== "string") URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      if (typeof source !== "string") URL.revokeObjectURL(url);
      reject(new Error("Falha ao carregar imagem."));
    };

    img.src = url;
  });
}

export async function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  if (!isSupportedImageMime(file.type)) {
    throw new Error(`Formato não suportado: ${file.type || "desconhecido"}`);
  }
  return loadImageElement(file);
}

export async function loadImageFromClipboardItem(item: ClipboardItem): Promise<HTMLImageElement | null> {
  for (const mime of SUPPORTED_IMAGE_MIMES) {
    if (!item.types.includes(mime)) continue;
    const blob = await item.getType(mime);
    return loadImageElement(blob);
  }
  return null;
}

export function getImageDimensions(img: HTMLImageElement): { width: number; height: number } {
  return { width: img.naturalWidth || img.width, height: img.naturalHeight || img.height };
}
