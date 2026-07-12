# Temporal ASCII Pipeline

## Propósito

Converter GIFs como **sequência coerente**, não como frames independentes.
Elimina flickering, chuvisco de dither e troca aleatória de caracteres em áreas estáticas.

## Arquitectura

```
TemporalPipeline/
  MotionDetector.ts
  CharacterPersistence.ts
  TemporalDither.ts
  TemporalSmoothing.ts   (N-1 / N / N+1)
  NoiseReducer.ts
  MotionSharpen.ts
  RegionReuse.ts
  AdaptiveFPS.ts
  KeyframeManager.ts
  RegionOfInterest.ts
  TemporalConverter.ts   (orquestrador sequencial)
```

A pipeline de **imagem estática** (`image-pipeline/`) permanece intacta.
Módulos partilhados: resample, filtros, charset, dither clássico, render.

## Fluxo

1. Pass 1 — `runRgbaPipeline` + filtros + mapping field (+ noise/ROI)
2. Pass 2 — smooth(N−1,N,N+1) → motion map → sharpen → dither temporal →
   persistence → region reuse → keyframes → métricas

Com `temporal.enabled`, `AnimationPipeline.convert` **força caminho sequencial**
(workers paralelos desligados — quebrariam estado temporal).

## UI

Aba **Temporal** no painel GIF: toggles independentes + métricas.
Preview técnico: Original | Motion Map | Temporal Buffer | ASCII Final.

## Fora de escopo (esta etapa)

Timeline Editor, Frame Editor, Keyframe Editor, Motion Blur, interpolação manual.
