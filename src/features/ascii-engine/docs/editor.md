# Editor

`EditorDocument` com layers, selection, clipboard e histórico **command-pattern** (SSOT §3.3).

## Tools
| Tool | Status | Comportamento |
|------|--------|---------------|
| select | ready | `setSelection` / `applyToolAt` → região 1×1 |
| brush | ready | `paintAt(col,row)` — pinta `strokeChar` |
| eraser | ready | `eraseAt` — escreve `eraseChar` (default espaço) |
| fill | ready | `fillAt` — flood fill 4-conectado |
| stamp / text / transform | stub | descriptors apenas |

## History
- `CommandHistory` (max default 64) com `EditorCommand { execute, undo }`
- Path preferido: `applyCommand` / `paintAt` / `eraseAt` / `fillAt`
- APIs legadas (`setLayerMatrix`, `setConfig`, …) empilham `LegacySnapshotCommand` — undo/redo unificado

## ToolContext
`{ layer, selection, stroke: { char, eraseChar }, col, row }`

## Mutação
Células via `patchMatrixCells` (clone + patch imutável). Fill via `floodFillPatches`.
