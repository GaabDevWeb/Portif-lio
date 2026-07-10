# Editor

## Responsibility

`EditorDocument`: layers, selection, clipboard, tools mutantes + `CommandHistory` (undo/redo).

## Flow

Tool → `applyCommand` / patches imutáveis (`patchMatrixCells`) → history stack (max ~64).

## Tools ready

select, brush, eraser, fill, move, stamp, text (horizontal), character replace, region replace

## Stubs

transform, mask (blend complexo)

## Deps

Tipos matrix de `ascii-interaction`; UI `EditorToolsPanel`

## Limits

Sem masks/blend layers avançados. Text = linha horizontal simples.

## Extension

Nova tool: command + patches em `matrix-ops` / `tools.ts`; descriptor no painel.
