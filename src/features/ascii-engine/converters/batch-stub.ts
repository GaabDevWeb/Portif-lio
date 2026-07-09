import type { AsciiMatrix } from "@/features/ascii-interaction/image-pipeline/types";
import type { AsciiAnimation } from "@/features/ascii-interaction/animation-pipeline/types";
import type { ImagePipelineOptions } from "@/features/ascii-interaction/image-pipeline/types";

import type { ConversionProgressInfo } from "@/features/ascii-engine/converters/types";
import { isSvgFile } from "@/features/ascii-engine/converters/rasterize-svg";

export type BatchItemStatus = "stub" | "queued" | "done" | "error" | "skipped";

export interface BatchItemResult {
  name: string;
  mimeType: string;
  status: BatchItemStatus;
  note: string;
  matrix?: AsciiMatrix;
  animation?: AsciiAnimation;
  error?: string;
}

export interface BatchConvertResult {
  status: "stub";
  message: string;
  items: BatchItemResult[];
}

export interface BatchConvertOptions {
  /** Se true, tenta processar SVG/imagem via registry quando disponível. Default: false (stub puro). */
  processReady?: boolean;
  findAdapter?: (file: File) =>
    | {
        convert: (
          input: unknown,
          options: Partial<ImagePipelineOptions>,
          onProgress?: (p: ConversionProgressInfo) => void,
        ) => Promise<{ matrix?: AsciiMatrix; animation?: AsciiAnimation }>;
      }
    | undefined;
  pipelineOptions?: Partial<ImagePipelineOptions>;
  onProgress?: (completed: number, total: number) => void;
}

/**
 * Batch stub (P8): aceita File[] e devolve status "stub".
 * Opcionalmente processa ficheiros com adapter ready (SVG/imagem) em sequência.
 * ZIP/pasta de saída fica para fases futuras.
 */
export async function convertBatchStub(
  files: File[],
  options: BatchConvertOptions = {},
): Promise<BatchConvertResult> {
  const items: BatchItemResult[] = [];
  const total = files.length;
  const processReady = options.processReady === true;

  for (let i = 0; i < files.length; i++) {
    const file = files[i]!;
    options.onProgress?.(i, total);

    if (!processReady || !options.findAdapter) {
      items.push({
        name: file.name,
        mimeType: file.type || guessMime(file.name),
        status: "stub",
        note: "Batch converter stub — ZIP/pasta de saída ainda não implementado (P8).",
      });
      continue;
    }

    const adapter = options.findAdapter(file);
    if (!adapter) {
      items.push({
        name: file.name,
        mimeType: file.type || guessMime(file.name),
        status: "skipped",
        note: "Sem adapter ready para este ficheiro.",
      });
      continue;
    }

    try {
      const result = await adapter.convert(file, options.pipelineOptions ?? {});
      items.push({
        name: file.name,
        mimeType: file.type || guessMime(file.name),
        status: "done",
        note: result.matrix
          ? `Convertido (${result.matrix.cols}×${result.matrix.rows}).`
          : result.animation
            ? `Animação (${result.animation.frames.length} frames).`
            : "Convertido.",
        matrix: result.matrix,
        animation: result.animation,
      });
    } catch (err) {
      items.push({
        name: file.name,
        mimeType: file.type || guessMime(file.name),
        status: "error",
        note: "Falha na conversão.",
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  options.onProgress?.(total, total);

  return {
    status: "stub",
    message:
      "Batch API stub (P8): lista aceite; export ZIP/pasta multi-ficheiro ainda não implementado.",
    items,
  };
}

function guessMime(name: string): string {
  if (/\.svg$/i.test(name)) return "image/svg+xml";
  if (/\.gif$/i.test(name)) return "image/gif";
  if (/\.png$/i.test(name)) return "image/png";
  if (/\.jpe?g$/i.test(name)) return "image/jpeg";
  if (/\.webp$/i.test(name)) return "image/webp";
  return "";
}

export function describeBatchFile(file: File): string {
  if (isSvgFile(file)) return "svg";
  if (file.type.startsWith("image/")) return "image";
  return file.type || "unknown";
}
