"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

import { mergeAsciiConfig } from "@/features/ascii-interaction/config";
import { AsciiInteractionEngineCore } from "@/features/ascii-interaction/engine/ascii-interaction-engine-core";
import type { AsciiGridSource } from "@/features/ascii-interaction/grid/character-grid";
import {
  SurfaceState,
  type AsciiInteractionConfig,
  type AsciiInteractionEngineHandle,
  type EmitFieldInput,
} from "@/features/ascii-interaction/types";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

function isEmptySource(source: AsciiGridSource): boolean {
  if (typeof source === "string") return source.length === 0;
  return !source || source.cells.length === 0;
}

export interface AsciiInteractionEngineProps {
  /** Arte ASCII (texto multilinha ou matriz do pipeline). */
  source: AsciiGridSource;
  /** Alias de `source` para compatibilidade (apenas string). */
  image?: string;
  config?: Partial<AsciiInteractionConfig>;
  className?: string;
  /** Quando false, desativa captura de pointer (somente render estático). */
  interactive?: boolean;
}

/**
 * Superfície ASCII viva — componente público do ROOT OS.
 * A Hero e demais seções consomem apenas este wrapper.
 */
export const AsciiInteractionEngine = forwardRef<
  AsciiInteractionEngineHandle,
  AsciiInteractionEngineProps
>(function AsciiInteractionEngine(
  { source, image, config, className, interactive = true },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<AsciiInteractionEngineCore | null>(null);
  const roRef = useRef<ResizeObserver | null>(null);
  const configRef = useRef(config);
  configRef.current = config;
  const reducedMotion = useReducedMotion();

  const asciiSource: AsciiGridSource =
    !isEmptySource(source) ? source : image && image.length > 0 ? image : "";

  useImperativeHandle(ref, () => ({
    emitField: (input: EmitFieldInput) => {
      if (!engineRef.current) return "";
      return engineRef.current.emitField(input);
    },
    updateField: (id, patch) => {
      if (!engineRef.current) return false;
      return engineRef.current.updateField(id, patch);
    },
    removeField: (id: string) => {
      engineRef.current?.removeField(id);
    },
    clearFields: () => {
      engineRef.current?.clearFields();
    },
    setSurfaceState: (state: SurfaceState) => {
      engineRef.current?.setSurfaceState(state);
    },
    getSurfaceState: () =>
      engineRef.current?.getSurfaceState() ?? SurfaceState.Idle,
    updateConfig: (partial) => {
      engineRef.current?.updateConfig(partial);
    },
    setSource: (next) => {
      engineRef.current?.setSource(next);
    },
    getStats: () =>
      engineRef.current?.getStats() ?? {
        fps: 0,
        frameTimeMs: 0,
        renderTimeMs: 0,
        characterCount: 0,
        activeCharacterCount: 0,
        dirtyCount: 0,
        cursorX: 0,
        cursorY: 0,
        cursorRadius: 0,
        cursorActive: false,
        influencedArea: 0,
        surfaceState: SurfaceState.Idle,
      },
    getDebugSnapshot: (maxCells) =>
      engineRef.current?.getDebugSnapshot(maxCells) ?? {
        width: 0,
        height: 0,
        cols: 0,
        rows: 0,
        cellWidth: 0,
        cellHeight: 0,
        layoutOffsetX: 0,
        layoutOffsetY: 0,
        activeCells: [],
      },
    destroy: () => {
      roRef.current?.disconnect();
      roRef.current = null;
      engineRef.current?.destroy();
      engineRef.current = null;
    },
  }));

  useEffect(() => {
    return () => {
      roRef.current?.disconnect();
      roRef.current = null;
      engineRef.current?.destroy();
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || isEmptySource(asciiSource)) return;

    let engine = engineRef.current;
    if (!engine) {
      const merged = mergeAsciiConfig(configRef.current);
      engine = new AsciiInteractionEngineCore(asciiSource, merged);
      engineRef.current = engine;
      engine.mount(canvas, reducedMotion);

      roRef.current?.disconnect();
      const ro = new ResizeObserver(() => {
        engineRef.current?.resize();
      });
      roRef.current = ro;
      const parent = canvas.parentElement;
      if (parent) ro.observe(parent);
    } else {
      engine.setSource(asciiSource);
    }
    // reducedMotion aplicado via setReducedMotion; mount inicial usa valor atual
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asciiSource]);

  useEffect(() => {
    engineRef.current?.setReducedMotion(reducedMotion);
  }, [reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        pointerEvents: interactive ? "auto" : "none",
      }}
    />
  );
});
