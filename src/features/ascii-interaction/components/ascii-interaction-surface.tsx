"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

import {
  HERO_ASCII_INTERACTION_CONFIG,
  mergeAsciiConfig,
} from "@/features/ascii-interaction/config";
import type { AsciiInteractionConfig } from "@/features/ascii-interaction/types";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

const AsciiInteractionEngine = dynamic(
  () =>
    import("@/features/ascii-interaction/AsciiInteractionEngine").then(
      (m) => m.AsciiInteractionEngine,
    ),
  { ssr: false },
);

export interface AsciiInteractionSurfaceProps {
  source: string;
  /** `hero` — preenche o ancestral posicionado (Hero landing). `inline` — caixa com proporção da grade. */
  layout?: "hero" | "inline";
  config?: Partial<AsciiInteractionConfig>;
  className?: string;
  canvasClassName?: string;
  interactive?: boolean;
}

function measureAsciiGrid(source: string): { cols: number; rows: number } {
  const lines = source.trimEnd().split("\n");
  return {
    rows: lines.length,
    cols: Math.max(1, ...lines.map((line) => line.length)),
  };
}

/**
 * Superfície compartilhada — encapsula o mesmo wrapper da Hero:
 * AsciiInteractionEngine + preset HERO + reduced motion.
 */
export function AsciiInteractionSurface({
  source,
  layout = "hero",
  config,
  className,
  canvasClassName = "h-full w-full opacity-90",
  interactive,
}: AsciiInteractionSurfaceProps) {
  const reducedMotion = useReducedMotion();

  const mergedConfig = useMemo(
    () => mergeAsciiConfig({ ...HERO_ASCII_INTERACTION_CONFIG, ...config }),
    [config],
  );

  const isInteractive = interactive ?? !reducedMotion;

  const inlineStyle = useMemo(() => {
    if (layout !== "inline") return undefined;
    const { cols, rows } = measureAsciiGrid(source);
    const width = cols * mergedConfig.cellWidth;
    const height = rows * mergedConfig.cellHeight;
    return { aspectRatio: `${width} / ${height}` };
  }, [layout, source, mergedConfig.cellWidth, mergedConfig.cellHeight]);

  const containerClass =
    layout === "hero"
      ? "pointer-events-none absolute inset-0 overflow-hidden"
      : "relative w-full overflow-hidden";

  return (
    <div
      className={[containerClass, className].filter(Boolean).join(" ")}
      style={inlineStyle}
      aria-hidden
    >
      <AsciiInteractionEngine
        source={source}
        config={mergedConfig}
        className={canvasClassName}
        interactive={isInteractive}
      />
    </div>
  );
}
