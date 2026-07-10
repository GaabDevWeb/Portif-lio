# Exporters

## Responsibility

Saída Blob-first: matrix / animation / project → ficheiro ou clipboard. Download só em adapters browser.

## Flow

Catalog `EXPORTER_CATALOG` → helpers (`matrixTo*`, `download*`, clipboard) → `downloadBlob` (browser) ou FS (CLI).

## Ready

txt, json, html (RGB/célula), svg, png, ansi truecolor, markdown, clipboard, zip, gif, txt-sequence, sprite-sheet, project ZIP

## Stub

pdf

## Deps

image/animation pipeline exporters; `ascii-engine/browser`; `storage/project-zip`

## Limits

Dívida: `downloadBlob` duplicado (browser vs animation-pipeline zip utils). Não inverter deps interaction → engine.

## Extension

Novo formato: descriptor + função Blob; UI Studio só dispara o adapter.
