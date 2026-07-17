# Phase log — Standalone Wave 2

**Branch:** `ascii-engine-platform`  
**Date:** 2026-07-10  
**Status:** done

## Entrega

- Presets schema **v2** (`charset`, `mappingMode`/`algorithm`, `dithering`, `colorMode`/`colors`, `gamma`, `contrast`, `brightness`, `effects`, `rendererId`, `themeId`, `defaultExporter`) + migração v1→v2
- Módulo **recipes** com 24 packs built-in (CRT Green/Amber, IBM, GameBoy, Matrix, Blueprint, Cyberpunk, ANSI, DOS, Linux, Windows Terminal, Portrait/Manga/Pixel/Sketch, Low/High Contrast, Noir, Retro Monitor, Anime, Terminal, Sketch, Pixel Art, Phosphor)
- UI: `ThemesPresetsPanel` — browse/filtro/apply de recipes
- Color export: HTML per-cell RGB; ANSI truecolor (`ESC[38;2;…]`); SVG/PNG já preservavam RGB
- Testes: schema v2, apply recipe, HTML/ANSI color
- Docs: este log + `src/features/ascii-engine/docs/presets-themes.md`

## Gate

- [x] tsc --noEmit
- [x] vitest presets-recipes (+ exporters color)
- [x] commit W2
