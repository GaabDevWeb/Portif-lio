# ASCII Engine — Relatório de Extração (Platform → Standalone → Scene)

**Branch:** `ascii-engine-platform` (from `ascii-engine-next`)  
**Data:** 2026-07-10  
**Baseline:** V2.1 + fachada Next → Platform 3.0.0 → Standalone → **Scene Editor W0–W8**  
**SSOT produto:** [`ASCII-ENGINE-PLATFORM.md`](./ASCII-ENGINE-PLATFORM.md)  
**SSOT cena:** [`ASCII-SCENE-EDITOR.md`](./ASCII-SCENE-EDITOR.md)  
**Module docs:** [`docs/modules/`](../modules/)  
**Estado:** P0–P12 + Standalone W0–W6 + **Scene W0–W8** concluídos nesta branch. **Não mergear para `main`.**

## Decisões (histórico)

1. Fachada `src/features/ascii-engine/` em vez de mover `ascii-interaction` (zero breakage).
2. Branches `ascii-engine-next` / `ascii-engine-platform` (evitam prefixo `feature/` bloqueado).
3. **Standalone (W0):** ROOT OS / portfolio removidos; app = ASCII Engine Studio.
4. Rotas: **`/` = Studio**, **`/gallery`** = Gallery (já não `/labs/ascii`).
5. `ProjectDocument` = SSOT de sessão; `EditorDocument` = motor raster legado (tab Studio).
6. **Scene (W0–W8):** `SceneDocument` = SSOT da tab **Edit**; `AsciiMatrix` = buffer composto.
7. Playground / nodes / plugins / AI nunca alteram o Core runtime além de paths additive (`patchSource`, workers).
8. Exporters Blob-first; download só em adapters browser/CLI FS.
9. Preview **never-crop** (W1): fit/zoom/pan apenas; `layoutMode: intrinsic`.

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
| W6 | Module docs + quality audit |

## Scene Editor waves (W0–W8)

| Wave | Entrega |
|------|---------|
| W0 | SSOT `ASCII-SCENE-EDITOR.md` + auditoria |
| W1 | `SceneDocument` + compositor + `ProjectDocument.scene` |
| W2 | WorkspaceCamera + SceneViewport + tab Edit |
| W3 | ToolHost + BrushEngine + tools base + SceneHistory |
| W4 | LayersPanel + InspectorPanel |
| W5 | Shape/Text/Stamp objects |
| W6 | Asset/Shape libraries + effects |
| W7 | Clipboard + checkpoints + export composite |
| W8 | Module docs `scene-*.md` + revisão arquitetural + correções Major |

## SDK surface (`createAsciiEngine`)

```
version: "3.0.0-platform"
document, storage, editor, converters, nodes, plugins, ai,
playground, presets, exporters, importers, themes
(+ gallery, recipes, scene, brush, tools, libraries via barrel)
```

## Verificação (Scene W8)

| Check | Resultado |
|-------|-----------|
| `npx tsc --noEmit` | OK |
| `npx vitest run src/features/ascii-engine` | **95 passed** |
| Tab Edit | ImageObject from Convert, tools, layers, inspector, libraries |
| Never-crop | mantido no SceneViewport / LabViewport |
| Convert/Animate/Gallery | sem regressão intencional |

## Auditoria Scene W8 — achados

| Severidade | Achado | Resolução |
|------------|--------|-----------|
| Major | `noise` usava `Math.random` | Hash determinístico col/row/amount |
| Major | ReferenceObject sem raster | `payload.matrix` embutida + compositor |
| Major | `bindSceneHistory` não ligado na UI | `EditWorkspace` recebe `project` e faz bind |
| Debt | Dual `EditorDocument` vs `SceneDocument` | Documentado; Edit = scene SSOT; Studio tab = legado |
| Minor | LibraryPanel desligado | Ligado na Edit sidebar |
| Known | Group não rasteriza; MiniMap/rulers stubs | Fora de escopo / schema preparado |

## Duplicações remanescentes (dívida consciente)

| Item | Estado | Notas |
|------|--------|-------|
| `EditorDocument` vs `SceneDocument` | Dual | Edit usa scene; Studio tools usam editor raster. Unificar só após deprecar matrix tools. |
| `downloadBlob` | 2 cópias | `ascii-engine/browser` + `animation-pipeline/utilities/zip` |
| Slider/Toggle | N painéis | Migração gradual → `studio/ui/controls.tsx` |
| Presets física vs produto | Parcial | Schema v2 + recipes OK; `studio/Presets.ts` física ainda paralelo |

## Ainda pendente (pós-Scene)

- Dirty-region compositor / virtualização de bounds
- Serializar stack real de SceneCommand (hoje: contagens + checkpoints)
- MiniMap UI, rulers/guides/snap polished
- FIGlet completo; brushes experimentais polished
- Video/webcam/PDF/screen reais
- Packages npm `@ascii-engine/*`
- Unificar `downloadBlob` na extração de packages

## Recomendações open-source

1. Monorepo `packages/core|react|browser|cli`
2. Remover aliases `@/` no package
3. Exporters só `Blob`; CLI escreve FS
4. Manter `animation.ascii.zip` + `*.ascii-project.zip` como interop
5. Visual regression `/` + `/gallery` + tab Edit
6. Licença + fixtures de benchmark

*Não mergear para main até review de produto.*
