import type { AsciiMatrix, ImagePipelineOptions } from "@/features/ascii-interaction/image-pipeline/types";

/** Protocolo main ↔ image conversion worker (RGBA → AsciiMatrix). */

export interface ImageWorkerConvertMessage {
  type: "convert-image";
  requestId: string;
  width: number;
  height: number;
  pixels: Uint8ClampedArray;
  options: ImagePipelineOptions;
}

export interface ImageWorkerCancelMessage {
  type: "cancel";
  requestId: string;
}

export interface ImageWorkerResultMessage {
  type: "result";
  requestId: string;
  matrix: AsciiMatrix;
}

export interface ImageWorkerErrorMessage {
  type: "error";
  requestId: string;
  message: string;
}

export type ImageWorkerInboundMessage =
  | ImageWorkerConvertMessage
  | ImageWorkerCancelMessage;

export type ImageWorkerOutboundMessage =
  | ImageWorkerResultMessage
  | ImageWorkerErrorMessage;
