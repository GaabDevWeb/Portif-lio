# Presets & recipes

## Responsibility

Presets de produto (schema v2) + packs de recipes built-in aplicáveis ao pipeline/tema.

## Flow

Recipe pack → `recipeToPreset` / apply → `PresetStore` + themeId/exporter defaults. Migração v1→v2 no load.

## Schema v2 (campos-chave)

charset, mappingMode/algorithm, dithering, colorMode/colors, gamma, contrast, brightness, effects, rendererId, themeId, defaultExporter

## Deps

`ascii-engine/presets`, `ascii-engine/recipes` (24 packs), themes; UI `ThemesPresetsPanel`

## Limits

Presets de física do lab (`studio/Presets.ts`) ainda paralelos ao schema produto — unificação gradual. Gallery remix usa `getRecipe` / `recipeToPreset`.

## Extension

Novo pack em `recipes/builtin`; schema bumps com migração explícita.
