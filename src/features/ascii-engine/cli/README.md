# CLI Ready (P10)

Binário Node mínimo via `tsx` — sem package separado ainda.

## Uso

```bash
npm run ascii-engine -- info
npm run ascii-engine -- benchmark [--width 80]
npm run ascii-engine -- convert <input> -o <output> [--width 80] [--format txt|json]
```

Entrypoint: `src/features/ascii-engine/cli/run.ts`

## Comandos

| Comando | Estado | Notas |
|---------|--------|-------|
| `info` | ready | versão + catálogos converters/exporters/importers/plugins |
| `benchmark` | ready | suite RGBA sintética (sem `HTMLImageElement`) |
| `convert` | ready | `.gif` (gifuct), `.txt`, `.json` → TXT/JSON |
| `export` | stub | — |
| `play` | stub | — |
| `analyze` | stub | — |
| `serve` | stub | — |

## Limites Node

- PNG/JPEG/WEBP/SVG: `sampleImage` / ImageAdapter usam canvas DOM — **não** no CLI sem `sharp`/`pngjs` (não adicionados nesta fase).
- Benchmark browser (`runBenchmarkSuite`) continua DOM-only; CLI usa `runNodeBenchmarkSuite`.
- Plugin packs não são auto-carregados; `info` lista host vazio + charsets built-in.

## Dependências

- `tsx` (devDep) para resolver paths `@/` e TypeScript
- Reutiliza `gifuct-js` já presente para GIF
