# Scene compositor

## Responsibility

`composeScene(scene, options) → AsciiMatrix` — flatten determinístico layers → objects → buffer de células.

## Flow

1. Itera layers visíveis (opacity da layer multiplica object).
2. Rasteriza cada objecto (image clone, text/shape procedural, stroke baked, reference `payload.matrix`).
3. Blit com opacity simulada + effects (invert/colorize/noise determinístico; outline/glow stub anel `.`).
4. `SceneCompositorCache` invalida por `scene.getRevision()`.

## Deps

`SceneDocument`, `effects.ts`, tipos `AsciiMatrix`.

## Limits

- Sem dirty-region parcial ainda (recompor cena inteira por revision).
- Stroke sem `baked` → invisível.
- Reference sem `matrix` embutida → invisível (libraries externas não resolvidas no compose).
- Blend modes além de “maior luminance wins” = stub.

## Extension

Cache por object hash; stroke buffer live → commit no pointer-up (tools). Soft cap de bounds documentado no SSOT.
