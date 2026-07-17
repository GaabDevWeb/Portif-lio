import { getImageDimensions } from "@/features/ascii-interaction/image-pipeline/image-loader";
import { matrixToAsciiSource } from "@/features/ascii-interaction/image-pipeline/exporter";
import { runImagePipeline, withResolvedGlyphMetrics } from "@/features/ascii-interaction/image-pipeline/pipeline";
import type {
  ImagePipelineOptions,
  PipelineResult,
} from "@/features/ascii-interaction/image-pipeline/types";
import type {
  ImageWorkerInboundMessage,
  ImageWorkerOutboundMessage,
} from "@/features/ascii-interaction/image-pipeline/workers/image-worker-protocol";

let sharedWorker: Worker | null = null;
let requestSeq = 0;

function ensureImageWorker(): Worker | null {
  if (typeof Worker === "undefined") return null;
  if (!sharedWorker) {
    try {
      sharedWorker = new Worker(
        new URL("./image.worker.ts", import.meta.url),
        { type: "module" },
      );
    } catch {
      return null;
    }
  }
  return sharedWorker;
}

/** Extrai RGBA natural da imagem no main thread (DOM / canvas). */
export function sampleImagePixels(image: HTMLImageElement): {
  pixels: Uint8ClampedArray;
  width: number;
  height: number;
} {
  const { width, height } = getImageDimensions(image);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas 2D indisponível.");
  ctx.drawImage(image, 0, 0, width, height);
  const { data } = ctx.getImageData(0, 0, width, height);
  return { pixels: data, width, height };
}

function buildPipelineResult(
  image: HTMLImageElement,
  matrix: import("@/features/ascii-interaction/image-pipeline/types").AsciiMatrix,
  conversionMs: number,
): PipelineResult {
  const { width: imgW, height: imgH } = getImageDimensions(image);
  return {
    matrix,
    source: matrixToAsciiSource(matrix),
    previewDataUrl:
      image.src.startsWith("data:") || image.src.startsWith("blob:")
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

/**
 * Converte imagem via worker (sample no main → RGBA transferível → matrix).
 * Fallback síncrono para `runImagePipeline` se Worker indisponível / falhar.
 */
export function runImagePipelineAsync(
  image: HTMLImageElement,
  options: ImagePipelineOptions,
  signal?: { cancelled: boolean },
): Promise<PipelineResult> {
  const resolvedOptions = withResolvedGlyphMetrics(options);
  const worker = ensureImageWorker();
  if (!worker) {
    return Promise.resolve(runImagePipeline(image, resolvedOptions));
  }

  const start = performance.now();
  let sampled: ReturnType<typeof sampleImagePixels>;
  try {
    sampled = sampleImagePixels(image);
  } catch {
    return Promise.resolve(runImagePipeline(image, resolvedOptions));
  }

  if (signal?.cancelled) {
    return Promise.reject(new DOMException("Cancelled", "AbortError"));
  }

  const requestId = `img-${Date.now()}-${++requestSeq}`;
  const pixelsCopy = new Uint8ClampedArray(sampled.pixels);

  return new Promise((resolve, reject) => {
    const handler = (event: MessageEvent<ImageWorkerOutboundMessage>) => {
      const msg = event.data;
      if (msg.requestId !== requestId) return;

      worker.removeEventListener("message", handler);

      if (signal?.cancelled) {
        reject(new DOMException("Cancelled", "AbortError"));
        return;
      }

      if (msg.type === "error") {
        try {
          resolve(runImagePipeline(image, resolvedOptions));
        } catch (err) {
          reject(err);
        }
        return;
      }

      resolve(buildPipelineResult(image, msg.matrix, performance.now() - start));
    };

    worker.addEventListener("message", handler);

    const payload: ImageWorkerInboundMessage = {
      type: "convert-image",
      requestId,
      width: sampled.width,
      height: sampled.height,
      pixels: pixelsCopy,
      options: resolvedOptions,
    };

    try {
      const buf = pixelsCopy.buffer;
      worker.postMessage(
        payload,
        buf instanceof ArrayBuffer ? [buf] : [],
      );
    } catch {
      worker.removeEventListener("message", handler);
      resolve(runImagePipeline(image, resolvedOptions));
    }
  });
}

/** Cancela um pedido em voo no worker partilhado (best-effort). */
export function cancelImageWorkerRequest(requestId: string): void {
  sharedWorker?.postMessage({ type: "cancel", requestId } satisfies ImageWorkerInboundMessage);
}

export function destroyImageWorker(): void {
  sharedWorker?.terminate();
  sharedWorker = null;
}
