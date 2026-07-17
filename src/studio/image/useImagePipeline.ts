"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { ImagePipelineOptions, PipelineResult } from "@/features/ascii-interaction/image-pipeline";
import { runImagePipelineAsync } from "@/features/ascii-interaction/image-pipeline";

const DEFAULT_DEBOUNCE_MS = 90;

/**
 * Conversão async com debounce — sliders fluidos sem flood de workers.
 */
export function useImagePipeline(
  image: HTMLImageElement | null,
  options: ImagePipelineOptions,
  debounceMs = DEFAULT_DEBOUNCE_MS,
): {
  result: PipelineResult | null;
  isProcessing: boolean;
} {
  const [result, setResult] = useState<PipelineResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const optionsRef = useRef(options);
  optionsRef.current = options;
  const genRef = useRef(0);

  useEffect(() => {
    if (!image) {
      setResult(null);
      return;
    }

    const generation = ++genRef.current;
    const signal = { cancelled: false };
    setIsProcessing(true);

    const timer = window.setTimeout(() => {
      void runImagePipelineAsync(image, optionsRef.current, signal)
        .then((pipelineResult) => {
          if (!signal.cancelled && generation === genRef.current) {
            setResult(pipelineResult);
          }
        })
        .catch((err) => {
          if (signal.cancelled) return;
          if (err instanceof DOMException && err.name === "AbortError") return;
          console.error("useImagePipeline:", err);
        })
        .finally(() => {
          if (!signal.cancelled && generation === genRef.current) {
            setIsProcessing(false);
          }
        });
    }, debounceMs);

    return () => {
      signal.cancelled = true;
      window.clearTimeout(timer);
    };
  }, [image, options, debounceMs]);

  return { result, isProcessing };
}

/** Optional helper for callers that need immediate flush (e.g. after Auto Optimize). */
export function useDebouncedCallback<T extends (...args: never[]) => void>(
  fn: T,
  ms: number,
): T {
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const tRef = useRef<number | null>(null);
  return useCallback(
    ((...args: never[]) => {
      if (tRef.current != null) window.clearTimeout(tRef.current);
      tRef.current = window.setTimeout(() => fnRef.current(...args), ms);
    }) as T,
    [ms],
  );
}
