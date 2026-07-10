# Phase log — Standalone Wave 3

**Branch:** `ascii-engine-platform`  
**Date:** 2026-07-10  
**Status:** done

## Entrega

Expandir converters / exporters / importers (I/O) sem tocar presets/recipes (W2) nem gallery (W4).

### Converters
- **clipboard** ready — `ClipboardAdapter` (`ClipboardItem` / `File` imagem)
- **canvas** ready — `CanvasAdapter` (`HTMLCanvasElement` → PNG → pipeline)
- **image** aceita `File` PNG/JPG/WEBP (além de `HTMLImageElement`) — necessário para batch
- **batch** — `convertBatch(File[])` sequencial real; `convertBatchStub` compat P8
- Stubs mantidos: video, webcam, screen, pdf

### Exporters
- **sprite-sheet** ready — atlas PNG dos frames (`renderAnimationSpriteSheet` / download)
- **clipboard** ready — `exportMatrixToClipboard` / `exportAnimationToClipboard` via `writeTextToClipboard` + `writeHtmlToClipboard`
- **ANSI** truecolor (24-bit) por célula
- HTML color por célula já no image-pipeline exporter (W2/gap fechado)

### Importers
- **html** ready — extrai texto de `<pre>`/`<code>` → `parseAsciiMatrixFromText`
- **svg** ready — SVG-as-text (`<text>` → grid ASCII); raster continua no SvgAdapter
- **gif-ascii** stub documentado
- Project ZIP já ready

### UI Studio
- Convert: Batch real + botão “Colar imagem do clipboard”
- Convert: Copy TXT / Copy HTML
- Animation: Sprite Sheet PNG + Copy frames TXT

### Ficheiros
- `src/features/ascii-engine/converters/{clipboard-adapter,canvas-adapter,batch,index}.ts`
- `src/features/ascii-engine/exporters/index.ts`
- `src/features/ascii-engine/importers/index.ts`
- `src/features/ascii-engine/browser/index.ts` (`writeHtmlToClipboard`)
- `src/studio/image/{BatchConvertStub,ClipboardPasteButton,ImageConverterPanel}.tsx`
- `src/studio/animation/AnimationConverterPanel.tsx`
- `docs/architecture/phase-logs/STANDALONE-W3.md`

## Verificação

- `npx tsc --noEmit`
- `npx vitest run src/features/ascii-engine`

## Critério de done

- [x] clipboard + canvas MVP ready no registry
- [x] batch sequencial real
- [x] sprite-sheet + clipboard export
- [x] HTML/SVG importers MVP
- [x] UI Convert mínima
- [x] phase-log W3
- [x] Sem presets/recipes (W2) / gallery (W4)
