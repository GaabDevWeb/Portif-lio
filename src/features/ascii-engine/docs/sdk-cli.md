# SDK & CLI

## SDK
```ts
import { createAsciiEngine } from "@/features/ascii-engine";
const engine = createAsciiEngine();
// P6: engine.nodes — NodeGraphRunner headless
// P9: engine.plugins — PluginHost (charset/theme contributions)
await engine.nodes.execute(graph, { bindings: { src: { image: buffer } } });
```

Ver também [nodes.md](./nodes.md).

## CLI
Stubs em `cli/commands.ts` — binário Node futuro reutiliza converters Blob-first.
