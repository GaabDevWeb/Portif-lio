# Converters

## Responsibility

Registry de `SourceAdapter`: input externo → `AsciiMatrix` | `AsciiAnimation`.

## Flow

`findFor(input)` → `convert(options, onProgress)` → matrix/animation. Batch: `convertBatch(File[])` sequencial.

## Ready

image (File PNG/JPG/WEBP + `HTMLImageElement`), gif, svg, clipboard, canvas

## Stubs

video, webcam, screen, pdf

## Deps

`ascii-interaction` image/animation pipelines; adapters em `ascii-engine/converters/`

## Limits

Sem ZIP/pasta multi-ficheiro; stubs sem decoder real.

## Extension

Novo adapter: implementar `SourceAdapter`, registar no `ConverterRegistry`.
