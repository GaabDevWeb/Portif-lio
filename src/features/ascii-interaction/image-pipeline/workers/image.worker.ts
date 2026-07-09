import { convertRgbaFrameToMatrix } from "@/features/ascii-interaction/animation-pipeline/converter/frame-converter";
import type {
  ImageWorkerInboundMessage,
  ImageWorkerOutboundMessage,
} from "@/features/ascii-interaction/image-pipeline/workers/image-worker-protocol";

const cancelled = new Set<string>();

self.onmessage = (event: MessageEvent<ImageWorkerInboundMessage>) => {
  const msg = event.data;

  if (msg.type === "cancel") {
    cancelled.add(msg.requestId);
    return;
  }

  if (msg.type === "convert-image") {
    const { requestId, width, height, pixels, options } = msg;
    try {
      if (cancelled.has(requestId)) {
        cancelled.delete(requestId);
        return;
      }
      const matrix = convertRgbaFrameToMatrix(
        { pixels, width, height },
        options,
      );
      if (cancelled.has(requestId)) {
        cancelled.delete(requestId);
        return;
      }
      const out: ImageWorkerOutboundMessage = {
        type: "result",
        requestId,
        matrix,
      };
      self.postMessage(out);
    } catch (err) {
      const out: ImageWorkerOutboundMessage = {
        type: "error",
        requestId,
        message: err instanceof Error ? err.message : String(err),
      };
      self.postMessage(out);
    }
  }
};

export {};
