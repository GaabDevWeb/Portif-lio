# Phase log — Standalone Wave 4

**Branch:** `ascii-engine-platform`  
**Date:** 2026-07-10  
**Status:** done

## Entrega

- Tipos `GalleryItem` / `GalleryCollection` / `GalleryQuery` + `GalleryRepository`
- `MockGalleryRepository` com 13 artes mock (categorias, tags, collections, `recipeId`)
- Favoritos via `localStorage` (`ascii-engine:gallery:favorites`)
- UI Gallery em `/gallery` (`src/app/gallery/page.tsx` + `src/studio/gallery/`)
- Ações: copy, edit → Studio (`/?gallery=&action=edit`), remix (aplica recipe W2 via `getRecipe`/`recipeToPreset`), export `.txt`
- Nav Studio ↔ Gallery (`StudioChromeNav`) no header desktop/mobile
- Domínio exportado em `src/features/ascii-engine/gallery/` (backend-ready, sem rede)

## Gate

- [x] tsc --noEmit
- [x] eslint paths tocados
- [x] zero backend
