# Scene workspace (camera + Edit UI)

## Responsibility

Câmera world-space em células + viewport da tab Edit.

## Flow

```
WorkspaceCamera {x,y,zoom} → screen↔world (camera.ts)
SceneViewport → composeScene → LabViewport (intrinsic / never-crop)
EditWorkspace WeakMap → history/tools/brush/selection partilhados sidebar↔canvas
```

Stubs: rulers, guides, snapping, minimap (interfaces prontas).

## Deps

`scene/camera.ts`, `studio/scene/*`, `LabViewport`, `ascii-interaction` config.

## Limits

- MiniMap UI completa fora de escopo (só stub).
- Rulers/guides/snap = no-op controllers.
- Dual undo: SceneHistory (Edit) ≠ EditorDocument CommandHistory (Studio).

## Extension

HUD screen-space fora do scale do world; Fit Selection via `fitCameraToBounds`.
