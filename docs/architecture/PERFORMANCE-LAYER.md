# Performance Layer — ASCII Engine v1.0

## Goals (aspirational → measure)

| Workload | Target |
|----------|--------|
| 1080p still | &lt; 100 ms |
| 4K still | &lt; 500 ms |
| 100-frame GIF (Balanced) | &lt; 5 s |

## Mechanisms already in place

- Image pipeline workers (`image-pipeline/workers`)
- Animation worker pool (classic path) + sequential Temporal path with `yieldToMain`
- Debounced Convert/Animate option updates (~90–450 ms)
- Frame cache + RGBA drop after full convert
- Quality tiers: Performance / Balanced / Maximum

## How to measure

```bash
npm run bench:conversion
```

Document results under `docs/architecture/phase-logs/CONVERSION-BENCH.md` (baseline 2026-07-19 recorded).

## Notes

- Temporal ON forces sequential convert (correctness &gt; parallel).
- Performance tier enables Adaptive FPS + narrower grid for long GIFs.
- Chromium ImageDecoder required for multi-frame WEBP; static WEBP falls back to 1 frame.
