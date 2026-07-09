import type { AsciiMatrix } from "@/features/ascii-interaction/image-pipeline/types";

import type {
  AiCharsetSuggestion,
  AiEnhanceResult,
  AiOcrResult,
  AiParamsSuggestion,
  AiPromptOptions,
  AiPromptResult,
  AiProvider,
  AiReverseResult,
} from "@/features/ascii-engine/ai/types";

const STUB_MESSAGE =
  "AiProvider stub — no network. Inject a real provider via createAsciiEngine({ ai }).";

function stub<T extends { status: "stub"; method: string; message: string }>(
  method: string,
  extra?: Omit<T, "status" | "method" | "message">,
): T {
  return { status: "stub", method, message: STUB_MESSAGE, ...extra } as T;
}

/**
 * Provider default: todos os métodos devolvem payload `status: "stub"`.
 * Não faz fetch, WebSocket, nem qualquer I/O de rede.
 */
export class StubAiProvider implements AiProvider {
  readonly id = "stub";
  readonly status = "stub" as const;

  async promptToAscii(
    ..._args: [string, AiPromptOptions?]
  ): Promise<AiPromptResult> {
    void _args;
    return stub("promptToAscii");
  }

  async suggestCharset(..._args: [AsciiMatrix]): Promise<AiCharsetSuggestion> {
    void _args;
    return stub("suggestCharset", { charsetId: undefined, confidence: 0 });
  }

  async suggestParams(..._args: [AsciiMatrix]): Promise<AiParamsSuggestion> {
    void _args;
    return stub("suggestParams", { params: undefined });
  }

  async enhance(..._args: [AsciiMatrix]): Promise<AiEnhanceResult> {
    void _args;
    return stub("enhance");
  }

  async reverseAscii(..._args: [AsciiMatrix]): Promise<AiReverseResult> {
    void _args;
    return stub("reverseAscii", { description: undefined });
  }

  async ocrAscii(..._args: [AsciiMatrix]): Promise<AiOcrResult> {
    void _args;
    return stub("ocrAscii", { text: undefined });
  }
}

export const defaultAiProvider: AiProvider = new StubAiProvider();

/**
 * Erro opcional para callers que preferem throw em vez de payload stub.
 * O StubAiProvider default não lança — usa este helper se quiser fail-fast.
 */
export class AiProviderNotConfiguredError extends Error {
  constructor(method: string) {
    super(`AiProvider.${method}: not configured (stub / no network)`);
    this.name = "AiProviderNotConfiguredError";
  }
}

/** Provider que lança em todos os métodos — útil em testes de “disabled”. */
export class ThrowingAiProvider implements AiProvider {
  readonly id = "throwing-stub";
  readonly status = "stub" as const;

  async promptToAscii(
    ..._args: [string, AiPromptOptions?]
  ): Promise<AiPromptResult> {
    void _args;
    throw new AiProviderNotConfiguredError("promptToAscii");
  }
  async suggestCharset(..._args: [AsciiMatrix]): Promise<AiCharsetSuggestion> {
    void _args;
    throw new AiProviderNotConfiguredError("suggestCharset");
  }
  async suggestParams(..._args: [AsciiMatrix]): Promise<AiParamsSuggestion> {
    void _args;
    throw new AiProviderNotConfiguredError("suggestParams");
  }
  async enhance(..._args: [AsciiMatrix]): Promise<AiEnhanceResult> {
    void _args;
    throw new AiProviderNotConfiguredError("enhance");
  }
  async reverseAscii(..._args: [AsciiMatrix]): Promise<AiReverseResult> {
    void _args;
    throw new AiProviderNotConfiguredError("reverseAscii");
  }
  async ocrAscii(..._args: [AsciiMatrix]): Promise<AiOcrResult> {
    void _args;
    throw new AiProviderNotConfiguredError("ocrAscii");
  }
}
