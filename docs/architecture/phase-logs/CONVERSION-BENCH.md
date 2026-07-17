# Conversion Benchmark Log

> Fixtures: `fixtures/conversion-bench/*.ppm` · Runner: `npm run bench:conversion -- --label <name>`  
> Note: `baseline` was captured after P0.1–P0.2 + density LUT were already on the branch (no pre-fix archive). Fingerprints stable across `after-p0-p1` confirm determinism; ms variance is noise.

## baseline — 2026-07-11T00:18:07.964Z

| fixture | convert ms | cols×rows | cells | fingerprint | heap MiB |
|---|---:|---|---:|---|---:|
| anime | 15.37 | 64×116 | 3955 | `f8397c00` | 9 |
| dark | 1.84 | 48×87 | 313 | `471425d8` | 9 |
| gif-long | 2.38 | 40×73 | 2538 | `60018cb6` | 10 |
| gif-short | 3.01 | 40×73 | 2883 | `c953b48d` | 9 |
| hires | 6.98 | 80×109 | 7865 | `586200ee` | 11 |
| landscape | 3.32 | 80×73 | 4685 | `a7c13f7a` | 12 |
| light | 2.32 | 48×87 | 4176 | `d8882d36` | 11 |
| lores | 0.25 | 24×29 | 591 | `4c52add5` | 12 |
| photo | 3.37 | 80×109 | 7919 | `8981f638` | 14 |
| pixel | 1.35 | 32×58 | 928 | `5baf1085` | 11 |
| portrait | 1.95 | 48×116 | 4872 | `b6768d88` | 14 |
| text | 0.95 | 64×58 | 1856 | `ae063345` | 15 |

## after-p0-p1 — 2026-07-11T00:19:13.310Z

| fixture | convert ms | cols×rows | cells | fingerprint | heap MiB |
|---|---:|---|---:|---|---:|
| anime | 14.21 | 64×116 | 3955 | `f8397c00` | 9 |
| dark | 1.45 | 48×87 | 313 | `471425d8` | 8 |
| gif-long | 2.41 | 40×73 | 2538 | `60018cb6` | 9 |
| gif-short | 2.4 | 40×73 | 2883 | `c953b48d` | 11 |
| hires | 7.47 | 80×109 | 7865 | `586200ee` | 10 |
| landscape | 3.57 | 80×73 | 4685 | `a7c13f7a` | 10 |
| light | 2.39 | 48×87 | 4176 | `d8882d36` | 10 |
| lores | 0.3 | 24×29 | 591 | `4c52add5` | 11 |
| photo | 3.25 | 80×109 | 7919 | `8981f638` | 12 |
| pixel | 0.43 | 32×58 | 928 | `5baf1085` | 13 |
| portrait | 2.34 | 48×116 | 4872 | `b6768d88` | 12 |
| text | 0.54 | 64×58 | 1856 | `ae063345` | 13 |
