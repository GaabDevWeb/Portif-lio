# SDK & CLI

## SDK
```ts
import { createAsciiEngine } from "@/features/ascii-engine";
const engine = createAsciiEngine();
// P9: engine.plugins — PluginHost (charset/theme contributions)
```

## CLI
Stubs em `cli/commands.ts` — binário Node futuro reutiliza converters Blob-first.
