# SDK facade (`ascii-engine`)

## Responsibility

Fachada de produto estável: registries, document/storage, editor, I/O, nodes, plugins, AI, CLI. Ponto de entrada `createAsciiEngine()`.

## Flow

```
App / Studio → createAsciiEngine(opts) → registries + ProjectDocument + storage
                    ↓
              core re-exports (ascii-interaction)
```

Versão: `3.0.0-platform`. Surface: `document`, `storage`, `editor`, `converters`, `nodes`, `plugins`, `ai`, `playground`, `presets`, `exporters`, `importers`, `themes`.

## Deps

- `ascii-interaction` (runtime)  
- Browser adapters em `browser/` (clipboard, download)  
- Sem Next.js no core do SDK

## Limits

- Ainda vive em `src/features/` (não packages npm `@ascii-engine/*`)  
- Aliases `@/` no código — bloqueiam extração limpa  
- AI default = stub (sem rede)

## Extension

Inject registries/providers via `AsciiEngineOptions`. Extração futura: monorepo `packages/core|react|browser|cli` sem reescrever pipelines.
