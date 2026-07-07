"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

import { mergeAsciiConfig } from "@/features/ascii-interaction/config";
import { AsciiInteractionEngineCore } from "@/features/ascii-interaction/engine/ascii-interaction-engine-core";
import {
  SurfaceState,
  type AsciiInteractionConfig,
  type AsciiInteractionEngineHandle,
  type EmitFieldInput,
} from "@/features/ascii-interaction/types";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export interface AsciiInteractionEngineProps {
  /** Arte ASCII multilinha (fonte primária). */
  source: string;
  /** Alias de `source` para compatibilidade. */
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
  const reducedMotion = useReducedMotion();

  const asciiSource = source || image || "";

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
    destroy: () => {
      engineRef.current?.destroy();
      engineRef.current = null;
    },
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !asciiSource) return;

    const merged = mergeAsciiConfig(config);

    const engine = new AsciiInteractionEngineCore(asciiSource, merged);
    engineRef.current = engine;
    engine.mount(canvas, reducedMotion);

    const ro = new ResizeObserver(() => {
      engine.resize();
    });
    const parent = canvas.parentElement;
    if (parent) ro.observe(parent);

    return () => {
      ro.disconnect();
      engine.destroy();
      engineRef.current = null;
    };
    // config omitido — objeto parcial instável; overrides via ref/imperative API
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asciiSource, reducedMotion]);

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
