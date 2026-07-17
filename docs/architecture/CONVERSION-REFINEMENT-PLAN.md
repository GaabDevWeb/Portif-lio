# Conversion Refinement Panel — Implementation Plan

**Date:** 2026-07-10  
**Branch:** `ascii-engine-platform`  
**Goal:** Non-destructive, real-time ASCII sculpting without removing existing features.

## Architecture

```
Original → applyImageFilters (modular) → mapping/dither → matrix → MatrixPreview
                ↑
         ImagePipelineOptions (extended)
                ↑
         RefinementPanel + undo stack + debounce → worker
```

## Tasks

1. Extend `ImagePipelineOptions` + filter chain (levels, invert split, density/bias, adaptive, bayer-2x2)
2. Histogram + autoOptimize utilities
3. Smart refinement presets + JSON copy/import (reuse preset I/O)
4. `RefinementPanel` accordion UI + `usePipelineHistory` + debounced `useImagePipeline`
5. Workspace wipe + minimap + sync pan in split
6. Tests for levels / density / aspect still green

## Non-goals

New formats, paint/layers, breaking existing invert/recipes (compat aliases kept).
