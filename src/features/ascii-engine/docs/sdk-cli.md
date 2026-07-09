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

## CLI (P10)

```bash
npm run ascii-engine -- info
npm run ascii-engine -- benchmark [--width 80]
npm run ascii-engine -- convert <input> -o <output> [--width 80]
```

| Comando | Node | Notas |
|---------|------|-------|
| `info` | ready | versão + registries |
| `benchmark` | ready | fixture RGBA sintética |
| `convert` | ready | GIF / TXT / JSON; PNG/JPEG browser-only |
| `export` / `play` / … | stub | SSOT §3.17 |

Entrypoint: `cli/run.ts` (tsx). Ver `cli/README.md`.
