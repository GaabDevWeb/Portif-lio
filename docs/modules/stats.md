# Stats

## Responsibility

Métricas e analytics da arte: heatmap luminância, frequência de chars, entropia, compressão estimada, charset coverage.

## Flow

Matrix/animation → `buildCharacterFrequency` / `analyzeCharset` / heatmap → `StatsPanel`.

## Deps

`ascii-engine/stats`; UI `studio/stats/StatsPanel`

## Limits

Estimativas (RLE/ZIP) — não compressão real obrigatória. Benchmark separado em `benchmark/`.

## Extension

Novas métricas em `analytics.ts`; painel só apresenta.
