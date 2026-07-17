"use client";

import { useCallback, useEffect, useState } from "react";

import type { ImagePipelineOptions } from "@/features/ascii-interaction/image-pipeline";
import {
  DEFAULT_IMAGE_PIPELINE_OPTIONS,
  mergePipelineOptions,
} from "@/features/ascii-interaction/image-pipeline";

const MAX_HISTORY = 64;

/**
 * Non-destructive undo/redo stack for pipeline options (Convert refinement).
 */
export function usePipelineHistory(initial: ImagePipelineOptions = DEFAULT_IMAGE_PIPELINE_OPTIONS) {
  const [options, setOptionsState] = useState<ImagePipelineOptions>(initial);
  const [past, setPast] = useState<ImagePipelineOptions[]>([]);
  const [future, setFuture] = useState<ImagePipelineOptions[]>([]);

  const commit = useCallback((next: ImagePipelineOptions) => {
    setPast((p) => {
      const stack = [...p, options];
      return stack.length > MAX_HISTORY ? stack.slice(stack.length - MAX_HISTORY) : stack;
    });
    setFuture([]);
    setOptionsState(next);
  }, [options]);

  const patch = useCallback(
    (partial: Partial<ImagePipelineOptions>) => {
      commit(mergePipelineOptions(options, partial));
    },
    [commit, options],
  );

  const replace = useCallback(
    (next: ImagePipelineOptions | Partial<ImagePipelineOptions>) => {
      commit(mergePipelineOptions(DEFAULT_IMAGE_PIPELINE_OPTIONS, next));
    },
    [commit],
  );

  const undo = useCallback(() => {
    setPast((p) => {
      if (p.length === 0) return p;
      const prev = p[p.length - 1]!;
      setFuture((f) => [options, ...f]);
      setOptionsState(prev);
      return p.slice(0, -1);
    });
  }, [options]);

  const redo = useCallback(() => {
    setFuture((f) => {
      if (f.length === 0) return f;
      const next = f[0]!;
      setPast((p) => [...p, options]);
      setOptionsState(next);
      return f.slice(1);
    });
  }, [options]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }
      if (e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((e.key === "z" && e.shiftKey) || e.key === "y") {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo]);

  return {
    options,
    patch,
    replace,
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    setOptionsSilent: setOptionsState,
  };
}
