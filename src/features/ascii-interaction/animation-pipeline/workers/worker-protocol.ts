import type { ImagePipelineOptions } from "@/features/ascii-interaction/image-pipeline/types";
import type { AsciiMatrix } from "@/features/ascii-interaction/image-pipeline/types";

/** Protocolo SSOT — mensagens main ↔ conversion worker. */

export interface WorkerConvertBatchMessage {
  type: "convert-batch";
  batchId: string;
  frames: Array<{
    index: number;
    width: number;
    height: number;
    pixels: Uint8ClampedArray;
  }>;
  options: ImagePipelineOptions;
}

export interface WorkerProgressMessage {
  type: "progress";
  batchId: string;
  completed: number;
  total: number;
}

export interface WorkerBatchResultMessage {
  type: "batch-result";
  batchId: string;
  matrices: AsciiMatrix[];
  indices: number[];
}

export interface WorkerCancelMessage {
  type: "cancel";
  batchId: string;
}

export type WorkerOutboundMessage =
  | WorkerProgressMessage
  | WorkerBatchResultMessage
  | { type: "error"; batchId: string; message: string };

export type WorkerInboundMessage = WorkerConvertBatchMessage | WorkerCancelMessage;
