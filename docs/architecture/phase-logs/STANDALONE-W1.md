# Phase log — Standalone Wave 1

**Branch:** `ascii-engine-platform`  
**Date:** 2026-07-10  
**Status:** done

## Entrega

- `layoutMode: "intrinsic"` no EngineCore + React wrapper
- `LabViewport` com tamanho intrínseco (cols×cellW × rows×cellH)
- `WorkspaceCanvas` mede content intrínseco; fit **sem** cap `1`
- Zoom: Fit / Fit W / Fit H / 100% / 200% / 400% / 800% + Fullscreen
- `measureAsciiLayout` + testes `workspace-fit.test.ts`

## Regra

Preview **nunca cropa** — só fit/zoom/pan no workspace.
