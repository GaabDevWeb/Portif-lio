import type {
  WorkerBatchResultMessage,
  WorkerInboundMessage,
  WorkerOutboundMessage,
} from "@/features/ascii-interaction/animation-pipeline/workers/worker-protocol";
import { convertRgbaFrameToMatrix } from "@/features/ascii-interaction/animation-pipeline/converter/frame-converter";

const cancelledBatches = new Set<string>();

self.onmessage = (event: MessageEvent<WorkerInboundMessage>) => {
  const msg = event.data;
  if (msg.type === "cancel") {
    cancelledBatches.add(msg.batchId);
    return;
  }

  if (msg.type === "convert-batch") {
    void handleBatch(msg, (payload) => {
      self.postMessage(payload);
    });
  }
};

async function handleBatch(
  msg: Extract<WorkerInboundMessage, { type: "convert-batch" }>,
  post: (msg: WorkerOutboundMessage) => void,
): Promise<void> {
  const { batchId, frames, options } = msg;
  const matrices = [];
  const indices: number[] = [];
  const total = frames.length;

  for (let i = 0; i < frames.length; i += 1) {
    if (cancelledBatches.has(batchId)) {
      cancelledBatches.delete(batchId);
      return;
    }
    const frame = frames[i]!;
    const matrix = convertRgbaFrameToMatrix(frame, options);
    matrices.push(matrix);
    indices.push(frame.index);
    post({ type: "progress", batchId, completed: i + 1, total });
  }

  cancelledBatches.delete(batchId);
  const result: WorkerBatchResultMessage = { type: "batch-result", batchId, matrices, indices };
  post(result);
};

export {};
