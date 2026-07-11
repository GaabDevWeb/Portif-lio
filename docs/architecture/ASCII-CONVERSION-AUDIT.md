# ASCII Conversion Audit

> **Branch:** `ascii-engine-platform`  
> **Date:** 2026-07-10  
> **Scope:** Image/GIF conversion quality, speed, preview↔export parity. **No new features.**

---

## 1. Pipeline overview

### Image (sync)

```
getImageDimensions → resolveOutputSize → sampleImage (canvas drawImage)
  → applyImageFilters → generateAsciiMatrix (mapping → dither → chars)
  → matrixToAsciiSource / exporters
```

### Image (async / Lab default)

```
sampleImagePixels (1:1) → worker convertRgbaFrameToMatrix
  → sampleRgba (nearest) → filters → generateAsciiMatrix
```

### GIF

```
decodeGifFile (gifuct + compose) → extractFrames → AnimationPipeline.convert
  → ConversionWorkerPool (chunks of 8) → AsciiAnimation + FrameCache
  → playback / GIF|ZIP|TXT export
```

---

## 2. Strengths

- Full filter stack (exposure, contrast, brightness, gamma, blur, sharpen, edge).
- Multiple dither modes exposed; Floyd–Steinberg and Burkes weights are correct.
- Aspect handling via `fontCompensation` (default 0.55) is directionally right for mono cells.
- GIF workers + transferables + `patchSource` + never-crop workspace already exist.
- Color modes and rich exporters (HTML/SVG/PNG/ANSI) are in place.

---

## 3. Critical quality bugs

| ID | Issue | Location | Impact |
|----|-------|----------|--------|
| Q1 | `distribute()` always divides by **42** | `dithering.ts` | Atkinson/Sierra/Jarvis wrong |
| Q2 | Levels double-decrement (`levels-1` twice) | `matrix-generator.ts` + dithering | Skips charset indices |
| Q3 | Worker path = **nearest**; sync = canvas bilinear | `rgba-processor.ts` vs `image-processor.ts` | Lab ≠ sync quality |
| Q4 | Charset order is manual; no ink-density measurement | `charset-mapper.ts` | Weak perceptual mapping |
| Q5 | Preview ≠ export (cell size, GlyphAtlas remap, alpha vs opaque fillText) | LabViewport / render-utils / glyph-atlas | WYSIWYG broken |
| Q6 | GIF: transferable detach; `workerCount` unused; FPS overwrites native delays | animation-pipeline / worker-pool | RAM/stability/timing |
| Q7 | `ansi256` almost greyscale only | `charset-mapper.ts` | Bad terminal color |
| Q8 | Rec.709 on sRGB-encoded bytes (no linearization) | sample paths | Midtone bias |

---

## 4. Performance waste

- Eager full RGBA for every GIF frame kept after convert.
- `source` string stored per frame even when unused until export.
- Progress `setState` every frame on main thread.
- GIF encode (gifenc + quantize) entirely on main thread.
- Transfer detach makes fallback/lazy paths unsafe.

---

## 5. Preview vs export parity risks

1. Preview uses `cellWidth×cellHeight` (7×12); PNG/GIF often use source image dimensions.
2. GlyphAtlas remaps unknown pipeline chars to last glyph of engine charset.
3. Preview applies luminance-based alpha + config opacity; export is opaque RGB.
4. Two raster paths: atlas `drawImage` vs `fillText` (different baseline/font size).
5. Interaction/physics on Engine tab alter display; Convert should be static.

---

## 6. Opportunities (priority order)

1. Fix dither math + levels (immediate fidelity).
2. Unify downscale to area-average for all paths.
3. Shared `MatrixRasterizer` for Convert/Animate preview and PNG/GIF.
4. Charset density LUT.
5. Linear luminance; fix ansi256.
6. GIF memory + safe workers + native delay option.
7. Export GIF off main thread; progress throttle.

---

## 7. Out of scope

Paint, layers, plugins, physics, playground, gallery, AI, new formats for novelty.

---

## 8. Research notes (practices to extract)

- jp2a / AAlib: glyph ink coverage for charset ramps.
- Modern converters: box/area downsample on downscale; FS + serpentine; preview = export raster.
- WASM: defer (P2) unless bench shows >20% gain after P0/P1.
