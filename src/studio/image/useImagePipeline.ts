"use client";

import { useEffect, useRef, useState } from "react";

import type { ImagePipelineOptions, PipelineResult } from "@/features/ascii-interaction/image-pipeline";
import { runImagePipelineAsync } from "@/features/ascii-interaction/image-pipeline";

/**
 * Conversão de imagem async via image worker (sample no main → RGBA→matrix no worker).
 * Fallback automático para `runImagePipeline` sync se Worker indisponível.
 */
export function useImagePipeline(
  image: HTMLImageElement | null,
  options: ImagePipelineOptions,
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

    return () => {
      signal.cancelled = true;
    };
  }, [image, options]);

  return { result, isProcessing };
}
