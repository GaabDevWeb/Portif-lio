# Converters

Registry de `SourceAdapter` por formato.

## Ready
- **image** — `HTMLImageElement` | `File` PNG/JPG/WEBP → image-pipeline
- **gif** — `File` → animation-pipeline + workers
- **svg** — File/Blob/markup → rasterize canvas → image-pipeline
- **clipboard** — `ClipboardItem` | `File` imagem → image-pipeline (UI: paste / botão Colar)
- **canvas** — `HTMLCanvasElement` → PNG blob → image-pipeline

## Stubs
video, webcam, screen, pdf

## Batch
`convertBatch(files, { findAdapter, processReady })` — conversão **sequencial** real via adapters ready.
- Default `processReady: true`
- `convertBatchStub` mantido (compat P8): default `processReady: false` → status `"stub"`
- ZIP/pasta multi-ficheiro: ainda não implementado

## Fluxo
`findFor(input)` → `convert(options, onProgress)` → matrix | animation

## SVG
`SvgAdapter` / `rasterizeSvgToImage`: carrega SVG como `Image`, desenha em canvas, exporta PNG blob → `HTMLImageElement` → `runImagePipeline`.
