import type { DecodedGif } from "@/features/ascii-interaction/animation-pipeline/types";
import { decodeGifBuffer, decodeGifFile } from "@/features/ascii-interaction/animation-pipeline/decoder/gif-decoder";
import { decodeWebpBuffer, decodeWebpFile } from "@/features/ascii-interaction/animation-pipeline/decoder/webp-decoder";

export type AnimationSourceKind = "gif" | "webp";

export function detectAnimationSourceKind(file: File): AnimationSourceKind | null {
  const name = file.name.toLowerCase();
  if (file.type === "image/gif" || name.endsWith(".gif")) return "gif";
  if (file.type === "image/webp" || name.endsWith(".webp")) return "webp";
  return null;
}

/** Decode GIF or animated/static WEBP into the shared DecodedGif frame list. */
export async function decodeAnimationFile(file: File): Promise<DecodedGif> {
  const kind = detectAnimationSourceKind(file);
  if (kind === "gif") return decodeGifFile(file);
  if (kind === "webp") return decodeWebpFile(file);
  throw new Error("Formato inválido: esperado GIF ou WEBP.");
}

export async function decodeAnimationBuffer(
  buffer: ArrayBuffer,
  mimeOrExt: string,
): Promise<DecodedGif> {
  const key = mimeOrExt.toLowerCase();
  if (key.includes("gif")) return decodeGifBuffer(buffer);
  if (key.includes("webp")) return decodeWebpBuffer(buffer);
  throw new Error("Formato inválido: esperado GIF ou WEBP.");
}
