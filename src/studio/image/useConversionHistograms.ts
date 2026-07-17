"use client";

import { useEffect, useState } from "react";

import type { ImagePipelineOptions, LuminanceHistogram } from "@/features/ascii-interaction/image-pipeline";
import {
  applyImageFilters,
  computeLuminanceHistogram,
  resolveOutputSize,
  sampleImage,
  withResolvedGlyphMetrics,
} from "@/features/ascii-interaction/image-pipeline";

/**
 * Lightweight before/after luminance histograms for the refinement panel.
 * Runs on a capped grid so UI stays fluid.
 */
export function useConversionHistograms(
  image: HTMLImageElement | null,
  options: ImagePipelineOptions,
): { before: LuminanceHistogram | null; after: LuminanceHistogram | null } {
  const [before, setBefore] = useState<LuminanceHistogram | null>(null);
  const [after, setAfter] = useState<LuminanceHistogram | null>(null);

  useEffect(() => {
    if (!image) {
      setBefore(null);
      setAfter(null);
      return;
    }
    let cancelled = false;
    const timer = window.setTimeout(() => {
      try {
        const resolved = withResolvedGlyphMetrics({
          ...options,
          width: Math.min(64, options.width),
        });
        const { width, height } = resolveOutputSize(
          image.naturalWidth || image.width,
          image.naturalHeight || image.height,
          resolved,
        );
        const sampled = sampleImage(image, width, height);
        if (cancelled) return;
        setBefore(computeLuminanceHistogram(sampled));
        const filtered = applyImageFilters(sampled, resolved);
        if (cancelled) return;
        setAfter(computeLuminanceHistogram(filtered));
      } catch {
        if (!cancelled) {
          setBefore(null);
          setAfter(null);
        }
      }
    }, 120);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [image, options]);

  return { before, after };
}
