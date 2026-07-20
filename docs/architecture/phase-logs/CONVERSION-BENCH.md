# Conversion Bench — 2026-07-19

Command: `npm run bench:conversion`  
Host: local (dev machine). Times are **pipeline convert only** on fixture grids — not full 1080p/4K wall-clock SLAs.

## Results (ms)

| Fixture | convertMs | cols×rows | cells |
|---------|-----------|-----------|-------|
| anime | 11.43 | 64×37 | 2368 |
| dark | 3.48 | 48×28 | 1344 |
| gif-long | 2.73 | 40×23 | 920 |
| gif-short | 2.79 | 40×23 | 920 |
| hires | 3.55 | 80×35 | 2800 |
| landscape | 4.79 | 80×23 | 1840 |
| light | 3.03 | 48×28 | 1344 |
| lores | 0.24 | 24×9 | 216 |
| photo | 4.57 | 80×35 | 2800 |
| pixel | 0.84 | 32×19 | 608 |
| portrait | 1.09 | 48×37 | 1776 |
| text | 0.39 | 64×19 | 1216 |

## Interpretation vs v1.0 SLAs

| Target | Status |
|--------|--------|
| 1080p &lt; 100 ms | **Not measured at 1080p** in this harness (fixtures are small grids). Worker path exists; re-run with larger widths to gate CI. |
| 4K &lt; 500 ms | Same — aspirational until dedicated 4K fixture. |
| 100-frame GIF &lt; 5 s (Balanced) | Not covered by still `bench:conversion`; use Temporal + quality tier in UI / future anim bench. |

Fixtures complete well under 100 ms at current grid sizes → core convert path is healthy. Document larger workloads before treating SLAs as release gates.

## Related

- `docs/architecture/PERFORMANCE-LAYER.md`
- Quality tiers: Performance / Balanced / Maximum
