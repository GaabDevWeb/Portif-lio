# ASCII Conversion — Implementation Plan

> **Rule:** Only ship changes that significantly improve conversion quality, speed, or preview↔export fidelity.  
> **Branch:** `ascii-engine-platform`

Each item: problem · solution · visual impact · performance · effort · priority.

---

## P0 — Immediate fidelity

### P0.1 Fix dithering
- **Problem:** `distribute()` always `/42`; levels decremented twice → wrong Atkinson/Sierra/Jarvis and skipped chars.
- **Solution:** Per-algorithm divisor; pass `charsetLen-1` once; serpentine for Floyd–Steinberg.
- **Visual:** High · **Perf:** Neutral · **Effort:** P · **Priority:** P0

### P0.2 Unified area-average resize
- **Problem:** Worker nearest ≠ sync canvas sample.
- **Solution:** Shared `resampleRgba(..., "area")` for sync + worker.
- **Visual:** High · **Perf:** Slightly more CPU, fewer artifacts · **Effort:** M · **Priority:** P0

### P0.3 Shared MatrixRasterizer
- **Problem:** Preview (GlyphAtlas) ≠ PNG/GIF (fillText).
- **Solution:** One rasterizer for Convert/Animate preview and PNG/GIF/SVG; same cell metrics.
- **Visual:** Critical (WYSIWYG) · **Perf:** Neutral · **Effort:** M · **Priority:** P0

### P0.4 Charset sync
- **Problem:** Atlas remaps pipeline chars.
- **Solution:** Conversion preview renders real `cell.char`; keep GlyphAtlas for Engine only.
- **Visual:** High · **Perf:** Neutral · **Effort:** P · **Priority:** P0

### P0.5 Safe GIF transfer
- **Problem:** Transferables detach RGBA; fallback unsafe.
- **Solution:** Stop transferring (or clone before transfer); safe fallback.
- **Visual:** Stability · **Perf:** Neutral · **Effort:** P · **Priority:** P0

### P0.6 Native GIF delays
- **Problem:** `targetFps` overwrites native frame delays.
- **Solution:** UI option “Use GIF timing” (`targetFps: 0`).
- **Visual:** Temporal fidelity · **Perf:** Neutral · **Effort:** P · **Priority:** P0

---

## P1 — Quality + speed

| ID | Solution | Visual | Perf | Effort |
|----|----------|--------|------|--------|
| P1.1 | Charset density LUT (ink coverage) | High | One-time cost | M |
| P1.2 | sRGB→linear before Rec.709 | Medium–High | Neutral | P |
| P1.3 | Real ansi256 cube | Medium | Neutral | P |
| P1.4 | Drop rgbaSource after convert; source on-demand | — | −RAM | M |
| P1.5 | Wire workerCount + throttle progress | — | Faster UX | P |
| P1.6 | GIF encode in worker | — | Main free | M |
| P1.7 | Discrete progress / cancel / convert shortcut | UX | — | P |

---

## P2 — Only with bench evidence

- Serpentine on all error-diffusion.
- Dense typed matrix buffers.
- WASM dither if >20% gain at 120×80+.
- Skip half-block/braille structural unless measurable fidelity win.

---

## Benchmark protocol

Fixtures under `fixtures/conversion-bench/`. Log to `docs/architecture/phase-logs/CONVERSION-BENCH.md`:

- convert ms, export ms, output bytes, matrix fingerprint (cols/rows/hash).

Run before and after each P0/P1 batch.
