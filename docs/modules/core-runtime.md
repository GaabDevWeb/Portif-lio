# Core runtime (`ascii-interaction`)

## Responsibility

Runtime de render/física: Influence Layer → Physics → Canvas2D, mais pipelines image/GIF.

## Flow

1. `emitField` / influencers escrevem no Influence Layer  
2. Physics integra forças → grid de células  
3. GlyphAtlas / Canvas2D pinta o frame  
4. Image/animation pipelines produzem `AsciiMatrix` / `AsciiAnimation` (workers opcionais)

## Deps

- Interno: `engine/`, `grid/`, `physics/`, `influence/`, `render/`, `image-pipeline/`, `animation-pipeline/`  
- Sem dependência de `ascii-engine` nem de Studio

## Limits

- Não conhece ProjectDocument, UI, plugins ou gallery  
- `downloadBlob` local em `animation-pipeline/utilities/zip` (dívida vs browser adapter)  
- `layoutMode: fill | intrinsic` — Studio usa `intrinsic` (never-crop)

## Extension

Novos influencers / physics hooks / exporters de pipeline. Paths additive (`patchSource`, worker pool) apenas — não inverter deps para o produto.
