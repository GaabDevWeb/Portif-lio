import type { AsciiMatrix } from "@/features/ascii-interaction/image-pipeline/types";
import type { ImagePipelineOptions } from "@/features/ascii-interaction/image-pipeline/types";

/** Resultado genérico de um método stub — sem rede. */
export interface AiStubPayload {
  status: "stub";
  method: string;
  message: string;
}

export interface AiPromptOptions {
  cols?: number;
  rows?: number;
  charset?: string;
}

export interface AiPromptResult extends AiStubPayload {
  matrix?: AsciiMatrix;
}

export interface AiCharsetSuggestion extends AiStubPayload {
  charsetId?: string;
  glyphs?: string;
  confidence?: number;
}

export interface AiParamsSuggestion extends AiStubPayload {
  params?: Partial<ImagePipelineOptions>;
}

export interface AiEnhanceResult extends AiStubPayload {
  matrix?: AsciiMatrix;
}

export interface AiReverseResult extends AiStubPayload {
  /** Descrição textual stub do conteúdo ASCII. */
  description?: string;
}

export interface AiOcrResult extends AiStubPayload {
  text?: string;
}

/**
 * Adapter de IA — contrato estável (§3.15).
 * Core/SDK nunca fazem fetch; a App injeta um provider real.
 */
export interface AiProvider {
  readonly id: string;
  /** `stub` = sem rede; `ready` = provider injectado pela App. */
  readonly status: "stub" | "ready";
  promptToAscii(prompt: string, options?: AiPromptOptions): Promise<AiPromptResult>;
  suggestCharset(matrix: AsciiMatrix): Promise<AiCharsetSuggestion>;
  suggestParams(matrix: AsciiMatrix): Promise<AiParamsSuggestion>;
  enhance(matrix: AsciiMatrix): Promise<AiEnhanceResult>;
  reverseAscii(matrix: AsciiMatrix): Promise<AiReverseResult>;
  ocrAscii(matrix: AsciiMatrix): Promise<AiOcrResult>;
}
