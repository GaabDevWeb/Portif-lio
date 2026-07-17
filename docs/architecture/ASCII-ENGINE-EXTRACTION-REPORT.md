# ASCII Engine — Relatório de Extração (Platform → Standalone)

**Branch:** `ascii-engine-platform` (from `ascii-engine-next`)  
**Data:** 2026-07-10  
**Baseline:** V2.1 + fachada Next → Platform 3.0.0 → **Standalone app**  
**SSOT:** [`ASCII-ENGINE-PLATFORM.md`](./ASCII-ENGINE-PLATFORM.md)  
**Module docs:** [`docs/modules/`](../modules/)  
**Estado:** P0–P12 + Standalone **W0–W6** concluídos nesta branch. **Não mergear para `main`.**

## Decisões (histórico)

1. Fachada `src/features/ascii-engine/` em vez de mover `ascii-interaction` (zero breakage).
2. Branches `ascii-engine-next` / `ascii-engine-platform` (evitam prefixo `feature/` bloqueado).
3. **Standalone (W0):** ROOT OS / portfolio removidos; app = ASCII Engine Studio.
4. Rotas: **`/` = Studio**, **`/gallery`** = Gallery (já não `/labs/ascii`).
5. `ProjectDocument` = SSOT de sessão; `EditorDocument` = motor de edição.
6. Playground / nodes / plugins / AI nunca alteram o Core runtime além de paths additive (`patchSource`, workers).
7. Exporters Blob-first; download só em adapters browser/CLI FS.
8. Preview **never-crop** (W1): fit/zoom/pan apenas; `layoutMode: intrinsic`.

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
| P12 | (hardening) | docs, checklist |

## Standalone waves (W0–W6)

| Wave | Entrega |
|------|---------|
| W0 | Studio em `/`; `src/labs/ascii` → `src/studio`; ROOT OS removido; package `ascii-engine` |
| W1 | Never-crop viewport (`intrinsic` + fit sem cap) |
| W2 | Presets schema v2 + 24 recipe packs + color export |
| W3 | Converters/exporters/importers I/O (clipboard, canvas, batch, sprite-sheet, html/svg import) |
| W4 | Gallery mock + `/gallery` + favoritos + remix/edit |
| W5 | Editor tools (move/stamp/text/replace); playground 12/12; analytics stats |
| W6 | Module docs + quality audit + este relatório |

## SDK surface (`createAsciiEngine`)

```
version: "3.0.0-platform"
document, storage, editor, converters, nodes, plugins, ai,
playground, presets, exporters, importers, themes
(+ gallery, recipes via barrel ascii-engine)
```

## Verificação (Standalone W6)

| Check | Resultado |
|-------|-----------|
| `npx tsc --noEmit` | OK |
| `npx vitest run src/features/ascii-engine src/studio src/features/ascii-interaction` | **12 files · 85 passed** |
| Rotas | `/` Studio · `/gallery` Gallery |
| ROOT OS | removido (W0) |

## Duplicações remanescentes (dívida consciente)

| Item | Estado | Notas |
|------|--------|-------|
| `downloadBlob` | 2 cópias | `ascii-engine/browser` (produto) + `animation-pipeline/utilities/zip` (runtime). **Não** inverter deps (interaction ↛ engine). Unificar só na extração `@ascii-engine/browser`. |
| Slider/Toggle | N painéis | Path principal usa `studio/ui/controls.tsx`; `ControlPanel` / `ImageConverterPanel` / `AnimationConverterPanel` ainda têm Sliders locais — migração gradual. |
| Presets física vs produto | Parcial | Schema v2 + recipes OK; `studio/Presets.ts` física ainda paralelo. |

## Melhorias vs relatório Platform P12

- App standalone (sem ROOT OS)
- Never-crop workspace
- Recipes v2 + gallery
- I/O expandido (W3)
- Editor/playground/analytics (W5)
- Docs por módulo em `docs/modules/`

## Ainda pendente (pós-Standalone)

- Video/webcam/PDF/screen reais
- Node editor canvas (não form UI)
- Plugin sandbox iframe/worker
- AI provider com rede (App-injected)
- Packages npm `@ascii-engine/*`
- PNG convert no CLI (precisa canvas/sharp)
- Unificar `downloadBlob` na extração de packages
- Migrar Sliders locais → `studio/ui/controls`

## Conversion Quality Sprint

**Foco:** fidelidade / velocidade / paridade preview↔export — **sem features novas**.

| Área | Resultado |
|------|-----------|
| Dither | Divisores correctos (Atkinson/8, Sierra/32, Stucki/42, Jarvis/48); levels sem double-decrement; FS serpentine |
| Resize | `resampleRgba` area-average unificado (sync + worker) + luminância linear |
| Preview === Export | `MatrixPreview` usa o mesmo `renderMatrixToCanvas` (célula 7×12) que PNG/GIF/SVG |
| Charset | LUT de densidade de tinta; ansi256 cubo 6×6×6 |
| GIF | Sem transfer detach; `workerCount` activo; timing nativo (`targetFps: 0`); menos RAM pós-convert |
| Bench | `fixtures/conversion-bench/` + `npm run bench:conversion` → `phase-logs/CONVERSION-BENCH.md` |
| P2 | WASM / matriz tipada / serpentine global — **adiados** (sem evidência de ganho &gt;20%) |

Detalhe: [`ASCII-CONVERSION-AUDIT.md`](./ASCII-CONVERSION-AUDIT.md), [`IMPLEMENTATION-PLAN.md`](./IMPLEMENTATION-PLAN.md), [`phase-logs/CONVERSION-QUALITY.md`](./phase-logs/CONVERSION-QUALITY.md).

## Recomendações open-source

1. Monorepo `packages/core|react|browser|cli`
2. Remover aliases `@/` no package
3. Exporters só `Blob`; CLI escreve FS
4. Manter `animation.ascii.zip` + `*.ascii-project.zip` como interop
5. Visual regression `/` + `/gallery`
6. Licença + fixtures de benchmark

*Não mergear para main até review de produto.*
