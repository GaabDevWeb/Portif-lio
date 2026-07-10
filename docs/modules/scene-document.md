# Scene document

## Responsibility

`SceneDocument` é o SSOT da tab **Edit**: layers, objects (image/text/shape/stroke/group/reference), selection, camera state, checkpoints.

## Flow

```
ProjectDocument.scene → SceneDocument
  → CRUD objects/layers → revision++
  → composeScene(scene) → AsciiMatrix (preview/export)
```

Persistência: `ProjectDocumentData.scene` no ZIP/`document.json`.

## Deps

Tipos matrix de `ascii-interaction`; history em `scene/history.ts`.

## Limits

- Soft canvas size (width/height da cena); virtualização futura documentada no SSOT.
- `GroupObject` é contentor lógico — filhos vivem em `layer.objectIds`; group não rasteriza sozinho.
- `EditorDocument` (tab Studio) continua paralelo — não misturar stacks de undo.

## Extension

Novos tipos: discriminante em `SceneObjectData` + branch em `rasterizeObject` no compositor.
