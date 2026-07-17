# Phase log — Standalone Wave 6

**Branch:** `ascii-engine-platform`  
**Date:** 2026-07-10  
**Status:** done

## Entrega

Docs + quality audit — **sem features de produto**.

### Module docs (`docs/modules/`)

Um markdown por módulo major: responsibility, flow, deps, limits, extension.

- core-runtime, sdk-facade, studio-ui
- converters, exporters, importers
- presets-recipes, gallery
- editor, animator, playground
- workspace-preview, storage-document
- plugins, nodes, ai, stats, cli

### Architecture updates

- `ASCII-ENGINE-EXTRACTION-REPORT.md` — estado standalone (W0–W6, ROOT OS gone, `/` + `/gallery`)
- `ASCII-ENGINE-PLATFORM.md` — header/status: standalone product branch

## Audit notes

### Dívida remanescente

| Item | Notas |
|------|--------|
| Dual `downloadBlob` | `ascii-engine/browser` + `animation-pipeline/utilities/zip`. Não inverter deps (interaction ↛ engine). Unificar na extração packages. |
| Sliders locais | `ControlPanel`, `ImageConverterPanel`, `AnimationConverterPanel` vs `studio/ui/controls`. Migração gradual. |
| Presets física vs produto | `studio/Presets.ts` paralelo ao schema v2/recipes. |

### Orphans (W0)

ROOT OS / portfolio features, rotas, assets e docs OS **removidos** na W0. Shell = Studio only.

### Never-crop (W1)

Preview **nunca cropa** — `layoutMode: intrinsic` + fit/zoom/pan no workspace. Ver `docs/modules/workspace-preview.md`.

## Checklist de gates

- [x] `npx tsc --noEmit` — OK
- [x] `npx vitest run src/features/ascii-engine src/studio src/features/ascii-interaction` — **12 files, 85 passed**
- [x] Module docs criados
- [x] Extraction report + PLATFORM header actualizados
- [x] Commit W6
- [x] Sem merge `main`

## Fora de scope

- Features de produto
- Unificar `downloadBlob` / migrar Sliders (dívida documentada apenas)
