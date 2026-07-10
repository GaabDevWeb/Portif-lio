# Presets, Recipes & Themes

## Presets (schema v2)

`AsciiEnginePreset` com campos de pipeline de primeira classe:

| Campo | Notas |
|-------|--------|
| `charset` | string de mapeamento |
| `mappingMode` / `algorithm` | alias mútuos |
| `dithering` | FS, ordered, bayer, … |
| `colorMode` / `colors` | mono → truecolor / root-os |
| `gamma`, `contrast`, `brightness` | tone |
| `effects` | playground effect ids |
| `rendererId` | default `canvas` |
| `themeId` | tema AE |
| `defaultExporter` | html / png / ansi / … |

Bags opcionais: `pipeline`, `interaction`, `workspace`.  
`parsePresetJson` migra **v1 → v2**. Helper: `presetToPipelinePatch`.

## Recipes

Packs product-facing no mesmo schema (`kind: "recipe"`).  
`src/features/ascii-engine/recipes/` — `listRecipes`, `getRecipe`, `applyRecipe`, `recipeToPreset`.  
24 built-ins (CRT, terminais, art packs, tone).

Studio: secção **Recipes** em `ThemesPresetsPanel`.

## Themes

DOS, CRT, Linux, Amber, IBM, GameBoy, Windows XP, Matrix, Mono, ROOT OS — CSS vars → tokens do shell.

## Color export

HTML/SVG/PNG/ANSI truecolor leem `AsciiMatrix.cells[].r|g|b` (HTML deixou de ser mono-only).
