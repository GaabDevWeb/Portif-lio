# Scene tools + brush

## Responsibility

`ToolHost` despacha tools independentes; `BrushEngine` carimba células em ImageObject/Stroke via presets serializáveis.

## Flow

```
Pointer (world cell) → ToolHost.active → onPointerDown/Move/Up(SceneToolContext)
  → BrushEngine.stamp* → SceneHistory (snapshot command no commit)
```

Tools ready: brush, pencil, eraser, fill, move, hand, zoom.

## Deps

`scene/` (document, history, camera types), `brush/` presets.

## Limits

- Nome `SceneToolContext` (não `ToolContext`) para não colidir com editor legado.
- Brushes experimentais (fire/smoke/rain/…) — presets existem; polish visual limitado.
- Tools não fazem setState React por célula — UI faz bump no commit.

## Extension

Registar tool em `createDefaultToolHost`; preset em `brush/presets.ts` com `status: ready | experimental`.
