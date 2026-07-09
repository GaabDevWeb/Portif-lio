# Stats & Benchmark

`buildStatsPanelModel` agrega FPS, memória estimada, histogram e **heatmap de luminância**.

## Heatmap (§3.11)

```ts
import { buildLuminanceHeatmap, formatHeatmapPreview } from "@/features/ascii-engine/stats";

const heatmap = buildLuminanceHeatmap(matrix);
// { cols, rows, values: Float32Array, min, max, mean, coverage }
```

- `values` — row-major 0..1 a partir de `cell.luminance`
- `coverage` — fração de células acima do limiar (default `0.05`)
- `formatHeatmapPreview` — downsample ASCII para o StatsPanel

`runBenchmarkSuite` compara mapping/dither/charset numa imagem fixture.
