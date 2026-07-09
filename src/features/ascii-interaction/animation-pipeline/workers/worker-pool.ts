import type { AsciiAnimationFrame, RgbaFrame } from "@/features/ascii-interaction/animation-pipeline/types";
import type {
  WorkerInboundMessage,
  WorkerOutboundMessage,
} from "@/features/ascii-interaction/animation-pipeline/workers/worker-protocol";
import type { ImagePipelineOptions } from "@/features/ascii-interaction/image-pipeline/types";
import { matrixToAsciiSource } from "@/features/ascii-interaction/image-pipeline/exporter";
import { convertRgbaFramesBatch } from "@/features/ascii-interaction/animation-pipeline/converter/frame-converter";

type BatchProgressCallback = (completed: number, total: number) => void;

export interface ConversionWorkerPoolOptions {
  /** Tamanho máximo do pool (default 4). Efetivo = min(poolSize, hardwareConcurrency). */
  poolSize?: number;
}

function resolvePoolSize(requested?: number): number {
  const hw =
    typeof navigator !== "undefined" && typeof navigator.hardwareConcurrency === "number"
      ? navigator.hardwareConcurrency
      : 4;
  const n = requested ?? 4;
  return Math.max(1, Math.min(n, hw));
}

/** Particiona `items` em até `parts` fatias contíguas (round-robin por tamanho). */
export function partitionBatch<T>(items: T[], parts: number): T[][] {
  if (items.length === 0 || parts <= 0) return [];
  const n = Math.min(parts, items.length);
  const chunks: T[][] = Array.from({ length: n }, () => []);
  for (let i = 0; i < items.length; i += 1) {
    chunks[i % n]!.push(items[i]!);
  }
  return chunks;
}

/** Pool de N workers para conversão de frames GIF em batches. */
export class ConversionWorkerPool {
  private workers: Worker[] = [];
  private readonly poolSize: number;
  private activeBatchId: string | null = null;
  private activeWorkerCount = 0;

  constructor(options?: ConversionWorkerPoolOptions) {
    this.poolSize = resolvePoolSize(options?.poolSize);
  }

  get size(): number {
    return this.poolSize;
  }

  private ensureWorkers(): Worker[] {
    if (this.workers.length === 0) {
      for (let i = 0; i < this.poolSize; i += 1) {
        this.workers.push(
          new Worker(new URL("./conversion.worker.ts", import.meta.url), {
            type: "module",
          }),
        );
      }
    }
    return this.workers;
  }

  convertBatch(
    frames: RgbaFrame[],
    options: ImagePipelineOptions,
    onProgress?: BatchProgressCallback,
  ): Promise<AsciiAnimationFrame[]> {
    if (typeof Worker === "undefined" || frames.length === 0) {
      return Promise.resolve(
        convertRgbaFramesBatch(frames, options, onProgress),
      );
    }

    return new Promise((resolve, reject) => {
      let workers: Worker[];
      try {
        workers = this.ensureWorkers();
      } catch {
        resolve(convertRgbaFramesBatch(frames, options, onProgress));
        return;
      }

      const batchId = `batch-${Date.now()}`;
      this.activeBatchId = batchId;
      const frameByIndex = new Map(frames.map((f) => [f.index, f]));
      const chunks = partitionBatch(frames, workers.length);
      const activeChunks = chunks.filter((c) => c.length > 0);
      this.activeWorkerCount = activeChunks.length;

      const collected = new Map<number, AsciiAnimationFrame>();
      let completedFrames = 0;
      const total = frames.length;
      let settled = false;
      let pendingWorkers = activeChunks.length;
      const progressByWorker = new Map<number, number>();

      const cleanup = () => {
        for (const w of workers) {
          w.removeEventListener("message", handler);
        }
        this.activeBatchId = null;
        this.activeWorkerCount = 0;
      };

      const finishOk = () => {
        if (settled) return;
        settled = true;
        cleanup();
        const results = [...collected.values()].sort((a, b) => a.index - b.index);
        resolve(results);
      };

      const finishErr = (err: Error) => {
        if (settled) return;
        settled = true;
        cleanup();
        reject(err);
      };

      const handler = (event: MessageEvent<WorkerOutboundMessage>) => {
        const msg = event.data;
        if (msg.batchId && msg.batchId !== batchId) return;

        if (msg.type === "progress") {
          // Progresso por shard: somar completed de cada worker (msg.total é local)
          const workerKey = (event.target as Worker | null)
            ? workers.indexOf(event.target as Worker)
            : 0;
          progressByWorker.set(workerKey, msg.completed);
          let sum = 0;
          for (const v of progressByWorker.values()) sum += v;
          completedFrames = Math.min(total, sum);
          onProgress?.(completedFrames, total);
          return;
        }

        if (msg.type === "error") {
          finishErr(new Error(msg.message));
          return;
        }

        if (msg.type === "batch-result") {
          for (let i = 0; i < msg.indices.length; i += 1) {
            const index = msg.indices[i]!;
            const matrix = msg.matrices[i]!;
            const rgba = frameByIndex.get(index);
            collected.set(index, {
              index,
              matrix,
              delayMs: rgba?.delayMs ?? 66,
              source: matrixToAsciiSource(matrix),
            });
          }
          pendingWorkers -= 1;
          if (pendingWorkers <= 0) {
            onProgress?.(total, total);
            finishOk();
          }
        }
      };

      for (const w of workers) {
        w.addEventListener("message", handler);
      }

      try {
        for (let wi = 0; wi < activeChunks.length; wi += 1) {
          const chunk = activeChunks[wi]!;
          const worker = workers[wi]!;
          const payload: WorkerInboundMessage = {
            type: "convert-batch",
            batchId,
            frames: chunk.map((f) => ({
              index: f.index,
              width: f.width,
              height: f.height,
              pixels: f.pixels,
            })),
            options,
          };
          const transferables = chunk
            .map((f) => f.pixels.buffer)
            .filter((buf): buf is ArrayBuffer => buf instanceof ArrayBuffer);
          worker.postMessage(payload, transferables);
        }
      } catch {
        cleanup();
        resolve(convertRgbaFramesBatch(frames, options, onProgress));
      }
    });
  }

  /** @deprecated use convertBatch */
  convertAll(
    frames: RgbaFrame[],
    options: ImagePipelineOptions,
    onProgress?: (p: { completed: number; total: number; percent: number; currentFrame: number; cancelled: boolean }) => void,
  ): Promise<AsciiAnimationFrame[]> {
    return this.convertBatch(frames, options, (completed, total) => {
      onProgress?.({
        completed,
        total,
        percent: total > 0 ? (completed / total) * 100 : 0,
        currentFrame: completed,
        cancelled: false,
      });
    });
  }

  cancel(): void {
    if (this.activeBatchId) {
      for (const w of this.workers) {
        w.postMessage({ type: "cancel", batchId: this.activeBatchId });
      }
    }
    this.activeBatchId = null;
    this.activeWorkerCount = 0;
  }

  destroy(): void {
    this.cancel();
    for (const w of this.workers) {
      w.terminate();
    }
    this.workers = [];
  }
}
