"use client";

import { useEffect, useRef, useState } from "react";

import type { ImagePipelineOptions, PipelineResult } from "@/features/ascii-interaction/image-pipeline";
import { runImagePipeline } from "@/features/ascii-interaction/image-pipeline";

/**
 * Conversão de imagem com yield ao main thread (cancelável).
 * Worker dedicado de imagem fica preparado via animation-pipeline path para RGBA;
 * HTMLImageElement ainda requer decode no main antes do processador.
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
    let cancelled = false;
    setIsProcessing(true);

    const timer = window.setTimeout(() => {
      try {
        const pipelineResult = runImagePipeline(image, optionsRef.current);
        if (!cancelled && generation === genRef.current) {
          setResult(pipelineResult);
        }
      } finally {
        if (!cancelled && generation === genRef.current) {
          setIsProcessing(false);
        }
      }
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [image, options]);

  return { result, isProcessing };
}
