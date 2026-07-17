"use client";

import { useEffect, useMemo, useRef } from "react";

import { AsciiInteractionEngine } from "@/features/ascii-interaction";
import type { AsciiGridSource } from "@/features/ascii-interaction";
import type {
  AsciiDebugSnapshot,
  AsciiEngineStats,
  AsciiInteractionConfig,
  AsciiInteractionEngineHandle,
} from "@/features/ascii-interaction/types";
import { measureAsciiLayout } from "@/features/ascii-interaction/utils/layout-size";

export interface LabViewportProps {
  source: AsciiGridSource;
  config: AsciiInteractionConfig;
  label?: string;
  debugEnabled?: boolean;
  className?: string;
  engineRef?: React.MutableRefObject<AsciiInteractionEngineHandle | null>;
  onStats?: (stats: AsciiEngineStats) => void;
  onDebugSnapshot?: (snapshot: AsciiDebugSnapshot) => void;
}

/**
 * Viewport do Studio — canvas intrínseco (never-crop).
 * O WorkspaceCanvas aplica fit/zoom/pan; este componente NÃO preenche o viewport.
 */
export function LabViewport({
  source,
  config,
  label,
  debugEnabled = false,
  className,
  engineRef: externalEngineRef,
  onStats,
  onDebugSnapshot,
}: LabViewportProps) {
  const internalRef = useRef<AsciiInteractionEngineHandle | null>(null);
  const engineRef = externalEngineRef ?? internalRef;
  const configRef = useRef(config);
  configRef.current = config;

  const layout = useMemo(() => measureAsciiLayout(source, config), [source, config]);

  useEffect(() => {
    engineRef.current?.updateConfig(configRef.current);
  }, [config, engineRef]);

  useEffect(() => {
    if (!onStats && !onDebugSnapshot) return;

    let raf = 0;
    const tick = () => {
      const handle = engineRef.current;
      if (handle) {
        onStats?.(handle.getStats());
        if (debugEnabled) {
          onDebugSnapshot?.(handle.getDebugSnapshot(400));
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onStats, onDebugSnapshot, debugEnabled, engineRef]);

  const interactive = config.enableInteraction !== false;

  return (
    <div
      className={`relative shrink-0 bg-[#050805] ${className ?? ""}`}
      style={{ width: layout.width, height: layout.height }}
      data-ascii-intrinsic={`${layout.cols}x${layout.rows}`}
    >
      {label ? (
        <div className="pointer-events-none absolute left-3 top-3 z-10 rounded border border-[#2a4a2a] bg-[#0a120a]/80 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-[#7dff7d]">
          {label}
        </div>
      ) : null}
      <AsciiInteractionEngine
        ref={engineRef}
        source={source}
        config={config}
        layoutMode="intrinsic"
        className="block"
        interactive={interactive}
      />
    </div>
  );
}
