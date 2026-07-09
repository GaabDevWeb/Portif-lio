"use client";

import { useEffect, useRef, useState } from "react";

import type { ImagePipelineOptions, PipelineResult } from "@/features/ascii-interaction/image-pipeline";
import { runImagePipeline } from "@/features/ascii-interaction/image-pipeline";

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

  useEffect(() => {
    if (!image) {
      setResult(null);
      return;
    }

    let cancelled = false;
    const frame = requestAnimationFrame(() => {
      setIsProcessing(true);
      try {
        const pipelineResult = runImagePipeline(image, optionsRef.current);
        if (!cancelled) setResult(pipelineResult);
      } finally {
        if (!cancelled) setIsProcessing(false);
      }
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [image, options]);

  return { result, isProcessing };
}
