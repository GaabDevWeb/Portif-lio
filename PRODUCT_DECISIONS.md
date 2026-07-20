# Product Decisions — ASCII Engine

## Identity

**ASCII Engine exists to convert media into ASCII with the highest quality possible. Any feature that does not contribute directly to that goal should be considered out of scope.**

ASCII Engine is:

- a professional **image** converter
- a professional **GIF / animation** converter

ASCII Engine is **not**:

- an ASCII editor / paint tool
- a creative sandbox or playground
- a node-graph / effects studio
- a scene compositor or timeline video editor

## Navigation (canonical)

```
ASCII ENGINE
  CONVERT
  ANIMATE
  LIBRARY    # Icons + Gallery
  DOCS
```

## Decision log

### 2026-07-19 — Product focus pivot

**Decision:** Remove Edit, Playground, Engine, Stats, and Studio from the product UI.

**Why:** Those surfaces diluted the first-run understanding of the tool ("what does this app do?"). Convert and Animate are the heart of the product and must not be downgraded.

**Implementation:**

- UI shell (`AsciiLab`) exposes Convert · Animate · Library · Docs.
- Library unifies Icons + Gallery.
- Experimental UI code moved to `src/legacy/`.
- Branding "ROOT OS" removed from product (theme/color → CRT Green).

### 2026-07-19 — v1.0 approvals

1. Library = Icons + Gallery — **yes**
2. Docs stays in nav — **yes**
3. Remove ROOT OS branding — **yes**
4. Frame interpolation = temporal/adaptive only (no optical invent)
5. PNG export @ source pixel size — **yes**
6. Experimental SDK not re-exported from product facade

**Gate for future features:**

> Does this improve conversion?

If **no** → out of scope for ASCII Engine.

## Explicitly out of scope

- Paint ASCII / brushes / layers
- Photoshop-style ASCII editing
- Timeline / keyframe editors (architecture may prepare; UI editors deferred)
- Motion blur / manual interpolation editors
- Node editor / effects graph
- Workspace / project managers

## Convert & Animate — non-negotiable

All existing Convert and Animate capabilities remain:

- Presets, dithering, colors, transparency, histograms, before/after, zoom, Auto Optimize
- Temporal pipeline (smoothing, persistence, motion, region reuse, temporal dither, adaptive FPS, ROI, keyframes bookkeeping)
- Exports: TXT, PNG, SVG, JSON, GIF, ZIP
