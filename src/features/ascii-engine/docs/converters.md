# Converters

Registry de `SourceAdapter` por formato.

## Ready
- image (HTMLImageElement)
- gif (File)
- svg (File/Blob/markup → rasterize canvas → image-pipeline)

## Stubs
video, webcam, canvas, clipboard, screen, pdf

## Batch
`convertBatchStub(files)` — API/UI stub (P8): aceita `File[]`, devolve `status: "stub"`.
ZIP/pasta multi-ficheiro ainda não implementado. Opção `processReady` pode chamar adapters ready em sequência.

## Fluxo
`findFor(input)` → `convert(options, onProgress)` → matrix | animation

## SVG
`SvgAdapter` / `rasterizeSvgToImage`: carrega SVG como `Image`, desenha em canvas, exporta PNG blob → `HTMLImageElement` → `runImagePipeline`.
