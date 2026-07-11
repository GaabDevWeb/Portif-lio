# Conversion Quality — Phase Log

**Sprint:** ASCII Conversion Quality  
**Branch:** `ascii-engine-platform`  
**Date:** 2026-07-10

## Delivered

### Docs
- `ASCII-CONVERSION-AUDIT.md` — Q1–Q8
- `IMPLEMENTATION-PLAN.md` — P0–P2
- Bench log: `phase-logs/CONVERSION-BENCH.md`

### P0
| Item | Change |
|------|--------|
| P0.1 | Per-algorithm dither divisors; levels = charset.length once; FS serpentine |
| P0.2 | Unified `resampleRgba` area-average + linear Rec.709; sync `sampleImage` uses same path |
| P0.3 | `MatrixPreview` + shared `renderMatrixToCanvas` for Convert/Animate |
| P0.4 | Preview renders `cell.char` (no GlyphAtlas remap on convert path) |
| P0.5 | GIF worker: clone pixels, no ArrayBuffer transfer |
| P0.6 | UI “Usar timing do GIF” → `targetFps: 0` |

### P1
| Item | Change |
|------|--------|
| P1.1 | Charset ink-density LUT + `mapLuminanceToCharByDensity` |
| P1.2 | sRGB→linear before Rec.709 in resample |
| P1.3 | Real ansi256 6×6×6 + greyscale ramp |
| P1.4 | Drop `rgbaSource` after convert; optional `source` string |
| P1.5 | `workerCount` wired into pool; progress throttled ~8 Hz |
| P1.6 | GIF encode with aggressive yield (OffscreenCanvas worker deferred — same rasterizer) |
| P1.7 | Cancel already present; native timing + workers sliders |

### P2 (evidence gate)
| Candidate | Decision |
|-----------|----------|
| WASM dither | **Skip** — Node bench convert already &lt;20 ms at 80×109; no &gt;20% gain expected vs JS for current sizes |
| Serpentine all ED | **Skip** — FS already serpentine (P0); no measurable fidelity bench for Atkinson/Sierra serpentine |
| Typed dense matrix | **Skip** — RAM win secondary to rgbaSource drop; revisit if GC shows up in profiling |
| Half-block/braille structural | **Skip** — density LUT already improves braille/block presets |

## Bench
See `CONVERSION-BENCH.md` (`baseline` = first measured post-P0.1/P0.2; `after-p0-p1` = full sprint).

## Tests
- `dithering.test.ts`
- `conversion-quality.test.ts` (density + area resample)
