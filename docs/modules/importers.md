# Importers

## Responsibility

Entrada de artefactos ASCII / project → `AsciiMatrix` | `AsciiAnimation` | `ProjectDocument`.

## Flow

`IMPORTER_CATALOG` → parse por formato → documento ou matrix.

## Ready

ascii-zip, txt, json, project ZIP, html (`<pre>`/`<code>`), svg-as-text (`<text>` → grid)

## Stub

gif-ascii (raster GIF continua no converter gif)

## Deps

animation-pipeline importer/parser; `storage/importProjectZip`

## Limits

SVG importer = texto ASCII, não raster (raster = SvgAdapter no converter).

## Extension

Novo importer: descriptor + parser; ligar UI Import no Studio se necessário.
