# Phase log — Standalone Wave 0

**Branch:** `ascii-engine-platform`  
**Date:** 2026-07-10  
**Status:** done

## Entrega

- Studio promovido para `/` (`src/app/page.tsx` → AsciiLab)
- `src/labs/ascii` → `src/studio` (+ panels)
- ROOT OS / portfolio removidos (features, rotas, assets, docs OS)
- package renomeado `ascii-engine`; deps podadas
- `next.config` slim; `globals.css` slim; sem RootOSProvider
- Fixture `hero-ascii` em `src/studio/fixtures/`

## Gate

- [x] tsc --noEmit
- [x] vitest ascii-engine + ascii-interaction
- [x] ascii-engine info
- [x] zero imports ROOT OS
