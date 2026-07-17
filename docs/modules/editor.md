# Editor

## Responsibility

`EditorDocument`: layers, selection, clipboard, tools mutantes + `CommandHistory` (undo/redo) — **motor raster legado** (tab Studio).

> **Scene Editor:** a tab **Edit** usa `SceneDocument` + `SceneHistory` (ver `docs/modules/scene-*.md`). Não misturar stacks.

## Flow

Tool → `applyCommand` / patches imutáveis (`patchMatrixCells`) → history stack (max ~64).

## Tools ready

select, brush, eraser, fill, move, stamp, text (horizontal), character replace, region replace

## Stubs

transform, mask (blend complexo)

## Deps

Tipos matrix de `ascii-interaction`; UI `EditorToolsPanel`

## Limits

Sem masks/blend layers avançados. Text = linha horizontal simples. Undo não persiste no ZIP (só contagens).

## Extension

Nova tool: command + patches em `matrix-ops` / `tools.ts`; descriptor no painel. Preferir novas features de edição visual na scene API.
