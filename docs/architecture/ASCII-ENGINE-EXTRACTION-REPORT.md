# ASCII Engine — Relatório de Extração (Platform)

**Branch:** `ascii-engine-platform` (from `ascii-engine-next`)  
**Data:** 2026-07-09  
**Baseline:** V2.1 + fachada Next → Platform 3.0.0  
**SSOT:** [`ASCII-ENGINE-PLATFORM.md`](./ASCII-ENGINE-PLATFORM.md)  
**Estado:** P0–P12 concluídos nesta branch. **Não mergear para `main`.**

## Decisões (histórico)

1. Fachada `src/features/ascii-engine/` em vez de mover `ascii-interaction` (zero breakage).
2. Branches `ascii-engine-next` / `ascii-engine-platform` (evitam prefixo `feature/` bloqueado).
3. Rota permanece `/labs/ascii`.
4. `ProjectDocument` = SSOT de sessão; `EditorDocument` = motor de edição.
5. Playground / nodes / plugins / AI nunca alteram o Core runtime além de paths additive (`patchSource`, workers).
6. Exporters Blob-first; download só em adapters browser/CLI FS.

## Fases Platform (P0–P12)

| Fase | Commit (tip) | Entrega |
|------|----------------|---------|
| P0 | `beebda7` | SSOT + prompt + pointer NEXT |
| P1 | `a3b2a88` | ProjectDocument + IDB + `.ascii-project.zip` |
| P2 | `0f4668e` | brush/eraser/fill + CommandHistory |
| P3 | `3d1634e` | image worker, `patchSource`, GIF pool N |
| P4 | `3025c32` | keyframes, interpolação, onion skin |
| P5 | `338bcd4` | +6 playground effects (10 ready) |
| P6 | `9987953` | NodeGraphRunner headless + 16 nodes |
| P7 | `7c55821` | NodeGraphPanel Studio |
| P8 | `a582d1d` | SVG converter + batch stub |
| P9 | `342b789` | PluginHost + charset pack |
| P10 | `6be9c4a` | CLI `convert|info|benchmark` |
| P11 | `d1ce4dc` | AiProvider stubs + heatmap |
| P12 | (este) | hardening, docs, checklist |

## SDK surface (`createAsciiEngine`)

```
version: "3.0.0-platform"
document, storage, editor, converters, nodes, plugins, ai,
playground, presets, exporters, importers, themes
```

## Verificação final (P12)

| Check | Resultado |
|-------|-----------|
| `npx tsc --noEmit` | OK |
| `npx vitest run src/features/ascii-engine` | **41 passed** |
| patchSource + worker-pool tests | **11 passed** |
| `npm run ascii-engine -- info` | OK |
| eslint paths core SDK/CLI/nodes/ai/document/storage | OK |
| Hero / ROOT OS produção | intocado |

## Duplicações remanescentes (dívida consciente)

| Item | Estado | Notas |
|------|--------|-------|
| `downloadBlob` | 2 cópias | `ascii-engine/browser` (produto) + `animation-pipeline/utilities/zip` (runtime). **Não** inverter deps (interaction ↛ engine). Unificar só na extração `@ascii-engine/browser`. |
| Slider/Toggle | N painéis | Lab path principal usa `ui/controls.tsx`; `ControlPanel` / converters image/gif ainda têm cópias locais — migração gradual. |
| Presets física vs produto | Parcial | Schema v2 unificado ainda futuro. |

## Melhorias vs relatório Next

- Worker de imagem + pool GIF multi-worker + `patchSource`
- Tools de edição mutantes + command history
- Keyframe interpolation + onion skin
- Node graph headless + UI mínima
- SVG converter real; project ZIP; PluginHost; CLI Node; AI stubs; heatmap
- Storage IndexedDB **ligado** via `ProjectStore`

## Ainda pendente (pós-Platform)

- Video/webcam/PDF/screen reais
- Node editor canvas (não form UI)
- Plugin sandbox iframe/worker
- AI provider com rede (App-injected)
- Packages npm `@ascii-engine/*`
- PNG convert no CLI (precisa canvas/sharp)
- Unificar `downloadBlob` na extração de packages

## Recomendações open-source

1. Monorepo `packages/core|react|browser|cli`
2. Remover aliases `@/` no package
3. Exporters só `Blob`; CLI escreve FS
4. Manter `animation.ascii.zip` + `*.ascii-project.zip` como interop
5. Visual regression `/labs/ascii`
6. Licença + fixtures de benchmark

*Não mergear para main até review de produto.*
