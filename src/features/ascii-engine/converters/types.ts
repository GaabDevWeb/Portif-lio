import type { AsciiMatrix } from "@/features/ascii-interaction/image-pipeline/types";
import type { AsciiAnimation } from "@/features/ascii-interaction/animation-pipeline/types";
import type { ImagePipelineOptions } from "@/features/ascii-interaction/image-pipeline/types";

export type ConverterKind =
  | "image"
  | "gif"
  | "video"
  | "webcam"
  | "canvas"
  | "clipboard"
  | "screen"
  | "svg"
  | "pdf";

export interface ConverterCapability {
  kind: ConverterKind;
  label: string;
  status: "ready" | "stub";
  mimeTypes: string[];
  description: string;
}

export interface ConversionProgressInfo {
  completed: number;
  total: number;
  percent: number;
}

export interface FrameProvider {
  readonly frameCount: number;
  getFrame(index: number): Promise<AsciiMatrix | null>;
}

export interface SourceAdapter {
  readonly kind: ConverterKind;
  readonly capability: ConverterCapability;
  canHandle(input: unknown): boolean;
  convert(
    input: unknown,
    options: Partial<ImagePipelineOptions>,
    onProgress?: (p: ConversionProgressInfo) => void,
  ): Promise<{ matrix?: AsciiMatrix; animation?: AsciiAnimation }>;
}
