# Phase log — Scene Editor W8

**Status:** done  
**Branch:** `ascii-engine-platform`

## Entrega

- Module docs: `docs/modules/scene-document.md`, `scene-compositor.md`, `scene-workspace.md`, `scene-tools.md`, `scene-objects.md`, `scene-libraries.md`, `scene-clipboard-export.md`
- Actualização `ASCII-ENGINE-EXTRACTION-REPORT.md` + header PLATFORM + `studio-ui` / `editor`
- Revisão arquitetural + correções Major

## Correções Major

1. **Noise determinístico** no compositor (hash col/row/amount)
2. **ReferenceObject** com `payload.matrix` + raster no compose; stamps embutem matrix
3. **`bindSceneHistory`** na Edit UI via `project` prop em `EditSidebar`/`EditViewport`
4. **LibraryPanel** ligado na Edit sidebar

## Dívida consciente (não Blocker)

- Dual `EditorDocument` (Studio) vs `SceneDocument` (Edit)
- GroupObject não rasteriza sozinho
- Command stack não serializa payloads (só contagens + checkpoints)
- MiniMap / rulers / guides / snap = stubs

## Gate

- [x] docs módulos scene
- [x] EXTRACTION-REPORT actualizado
- [x] Major fixes + testes W8
- [x] tsc + vitest scene/engine
