# ASCII Engine — API (SDK)

Ponto de entrada:

```ts
import { createAsciiEngine } from "@/features/ascii-engine";

const engine = createAsciiEngine({ themeId: "root-os" });
// engine.document  ProjectDocument
// engine.storage   ProjectStore (IndexedDB)
// engine.editor    EditorDocument
// engine.converters
// engine.nodes     NodeGraphRunner
// engine.plugins   PluginHost
// engine.ai        AiProvider (stub, sem rede)
// engine.playground, presets, exporters, importers, themes
```

## CLI

```bash
npm run ascii-engine -- info
npm run ascii-engine -- benchmark
npm run ascii-engine -- convert <input> -o <output>
```

## Documentação por módulo

Ver `src/features/ascii-engine/docs/` e `docs/architecture/ASCII-ENGINE-PLATFORM.md`.

Versão: **3.0.0-platform**
