# Scene libraries + effects

## Responsibility

Bibliotecas de assets/shapes procedurais e stack de effects não destrutivos no objecto.

## Flow

```
MockAssetLibrary / generateProceduralShape
  → insert*IntoScene → TextObject
EffectRef[] no SceneObject → applyEffects no compositor
LibraryPanel (Edit sidebar) → insert com SceneHistory
```

## Deps

`scene/effects.ts`, `scene/text.ts`, `studio/panels/LibraryPanel.tsx`.

## Limits

- Assets = snippets ASCII mock (não CDN).
- outline/glow/shadow/crt/scanline/posterize = stub ou parcial.
- noise = ready e **determinístico** (hash col/row/amount).

## Extension

Novas categorias em `mock-library.ts`; novos kinds em `EFFECT_STATUS`.
