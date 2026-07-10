# Phase log — Standalone Wave 5

**Branch:** `ascii-engine-platform`  
**Date:** 2026-07-10  
**Status:** done

## Entrega

### Editor (`src/features/ascii-engine/editor/`)

- Tools **ready**: Move, Stamp, Text (horizontal simples), Character Replace, Region Replace
- Mantém Brush / Eraser / Fill / Select
- Stubs: `transform`, `mask` (masks/blend complexos)
- `CompositeCommand` para move (células + selection)
- `copySelection` extrai região via `extractRegion` (stamp usa clipboard)
- Studio: `EditorToolsPanel` actualizado (params text/replace/Δmove)

### Playground

- **tornado** e **cloth** implementados via `emitField` (já não stubs)
- fire / rain(matrix) / water / wind / etc. permanecem ready
- 12/12 efeitos ready

### Analytics (`src/features/ascii-engine/stats/`)

- `buildCharacterFrequency` (ratios + entropia Shannon)
- `estimateCompressionRatio` (TXT vs RLE-estimate ou ZIP bytes)
- `analyzeCharset` (coverage + outside charset)
- `resolveFrameCount`
- `StatsPanel` secção Analytics (W5); heatmap já existia

## Verificação

- `npx tsc --noEmit`
- `npx vitest run` (editor + stats)

## Fora de scope (outros agents)

- Gallery routes
- Presets recipe packs
