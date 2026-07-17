# AI Ready (stubs)

Contrato §3.15 — adapters sem rede no Core/SDK.

## Uso

```ts
import { createAsciiEngine, type AiProvider } from "@/features/ascii-engine";

const engine = createAsciiEngine();
// default: StubAiProvider — todos os métodos devolvem { status: "stub" }
await engine.ai.promptToAscii("neon city skyline");

// App injeta provider real (fetch só fora do Core):
const engineWithAi = createAsciiEngine({ ai: myOpenAiProvider });
```

## Métodos (`AiProvider`)

| Método | Stub |
|--------|------|
| `promptToAscii` | payload stub, sem `matrix` |
| `suggestCharset` | payload stub |
| `suggestParams` | payload stub |
| `enhance` | payload stub |
| `reverseAscii` | payload stub |
| `ocrAscii` | payload stub |

`ThrowingAiProvider` — alternativa fail-fast para testes / UI “disabled”.

**Regra:** nenhum `fetch` / WebSocket / HTTP no módulo `ai/`. Rede só no provider injectado pela App.
