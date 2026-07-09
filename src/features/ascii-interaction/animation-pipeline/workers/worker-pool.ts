import type { AsciiAnimationFrame, RgbaFrame } from "@/features/ascii-interaction/animation-pipeline/types";
import type {
  WorkerInboundMessage,
  WorkerOutboundMessage,
} from "@/features/ascii-interaction/animation-pipeline/workers/worker-protocol";
import type { ImagePipelineOptions } from "@/features/ascii-interaction/image-pipeline/types";
import { matrixToAsciiSource } from "@/features/ascii-interaction/image-pipeline/exporter";
import { convertRgbaFramesBatch } from "@/features/ascii-interaction/animation-pipeline/converter/frame-converter";

type BatchProgressCallback = (completed: number, total: number) => void;

/** Pool de workers para conversão de frames GIF em batches. */
export class ConversionWorkerPool {
  private worker: Worker | null = null;
  private activeBatchId: string | null = null;

  private ensureWorker(): Worker {
    if (!this.worker) {
      this.worker = new Worker(
        new URL("./conversion.worker.ts", import.meta.url),
        { type: "module" },
      );
    }
    return this.worker;
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
      const worker = this.ensureWorker();
      const batchId = `batch-${Date.now()}`;
      this.activeBatchId = batchId;
      const frameByIndex = new Map(frames.map((f) => [f.index, f]));

      const handler = (event: MessageEvent<WorkerOutboundMessage>) => {
        const msg = event.data;
        if (msg.batchId && msg.batchId !== batchId) return;

        if (msg.type === "progress") {
          onProgress?.(msg.completed, msg.total);
          return;
        }

        if (msg.type === "error") {
          worker.removeEventListener("message", handler);
          this.activeBatchId = null;
          reject(new Error(msg.message));
          return;
        }

        if (msg.type === "batch-result") {
          worker.removeEventListener("message", handler);
          this.activeBatchId = null;
          const results: AsciiAnimationFrame[] = msg.indices
            .map((index, i) => {
              const matrix = msg.matrices[i]!;
              const rgba = frameByIndex.get(index);
              return {
                index,
                matrix,
                delayMs: rgba?.delayMs ?? 66,
                source: matrixToAsciiSource(matrix),
              };
            })
            .sort((a, b) => a.index - b.index);
          resolve(results);
        }
      };

      worker.addEventListener("message", handler);

      const payload: WorkerInboundMessage = {
        type: "convert-batch",
        batchId,
        frames: frames.map((f) => ({
          index: f.index,
          width: f.width,
          height: f.height,
          pixels: f.pixels,
        })),
        options,
      };

      try {
        worker.postMessage(payload);
      } catch {
        worker.removeEventListener("message", handler);
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
    if (this.worker && this.activeBatchId) {
      this.worker.postMessage({ type: "cancel", batchId: this.activeBatchId });
    }
    this.activeBatchId = null;
  }

  destroy(): void {
    this.cancel();
    this.worker?.terminate();
    this.worker = null;
  }
}
