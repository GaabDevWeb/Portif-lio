# Animator

## Responsibility

Ops de timeline/animação sobre frames: insert/remove/duplicate/merge, keyframes, interpolação, onion skin.

## Flow

Track/frames → keyframe sample (`sample-track`) → blend/onion compose → preview no Studio Animate.

## Deps

`AsciiAnimation` (animation-pipeline); `ascii-engine/animator/*`

## Limits

Sem editor de curvas sofisticado; onion = overlay de frames vizinhos. Video source continua stub no converter.

## Extension

Novos blend modes / interpolators em `blend-matrix` / `keyframe-ops` sem tocar no Core runtime.
