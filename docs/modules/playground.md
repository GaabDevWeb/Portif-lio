# Playground

## Responsibility

Efeitos experimentais via `emitField` no surface do engine — 12/12 ready.

## Flow

`PlaygroundRegistry` → `effect.mount(surface)` → rAF/timers → `surface.emitField(...)` → physics/render.

## Effects ready

matrix, ripple, smoke, gravity, fire, wind, particles, explosion, water, noise, tornado, cloth

## Deps

`InfluencerSurface` / tipos de `ascii-interaction`; UI `PlaygroundPanel`

## Limits

Só paths additive no Core (`emitField`). Não muta ProjectDocument directamente.

## Extension

Novo efeito: classe `PlaygroundEffect` + registo no default registry.
