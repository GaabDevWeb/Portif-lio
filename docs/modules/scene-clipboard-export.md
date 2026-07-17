# Scene clipboard + export + history

## Responsibility

Clipboard object-level, checkpoints, export do composite, ligação history → projeto.

## Flow

```
SceneClipboard copy/cut/paste/duplicate (cross-layer)
SceneDocument checkpoints → restore snapshot
exportSceneComposite* → composeScene + exporters TXT/JSON/matrix
ProjectDocument.bindSceneHistory(history) → pastCount/futureCount no toJSON
```

## Deps

`scene/clipboard.ts`, `scene/export.ts`, `scene/history.ts`, `ProjectDocument`.

## Limits

- Stack de comandos **não** serializa payloads completos — só contagens + checkpoints de cena.
- Undo real sobrevive a reload só via checkpoints (não via command stack).
- Clipboard de sessão (não system clipboard ainda).

## Extension

Serializar N últimos `SceneCommand` ou diff patches; HistoryBranch stub já no schema.
