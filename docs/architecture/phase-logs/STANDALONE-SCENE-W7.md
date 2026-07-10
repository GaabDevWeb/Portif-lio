# Phase log — Scene Editor W7

**Branch:** `ascii-engine-platform`  
**Date:** 2026-07-10  
**Status:** done

## Entrega

### Clipboard (`scene/clipboard.ts`)

- `SceneClipboard` — copy / cut / paste / duplicate entre layers
- Serializa `SceneObject[]`; novos IDs no paste; offset por geração

### Checkpoints + history no projeto

- `SceneDocument.listCheckpoints` / `getCheckpointCount` (add/restore já existiam)
- `ProjectDocument.addSceneCheckpoint` / `restoreSceneCheckpoint` / `bindSceneHistory`
- `toJSON().history.pastCount` reflecte SceneHistory + presença de checkpoints

### Export

- `exportSceneComposite` / `exportSceneCompositeTxt` / `exportSceneCompositeJson` / `exportSceneCompositeMatrix`
- Usa `composeScene` + `exportMatrix` / `matrixToAsciiSource`

### Tests

- paste cross-layer, cut/duplicate, checkpoints + pastCount, export TXT

## Gate

- [x] Clipboard paste
- [x] Checkpoints API no projeto
- [x] Export composite helper
- [x] tsc + vitest

## Fora de scope

- Wiring UI Edit tab (W2–W4 paralelo)
- Persistência completa do stack de comandos (só counts + checkpoints)
