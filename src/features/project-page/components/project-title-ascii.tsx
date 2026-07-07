"use client";

import { AsciiInteractionSurface } from "@/features/ascii-interaction/components/ascii-interaction-surface";
import type { AsciiInteractionConfig } from "@/features/ascii-interaction/types";

interface ProjectTitleAsciiProps {
  source: string;
  asciiConfig?: Partial<AsciiInteractionConfig>;
}

/** Título ASCII interativo — mesma superfície e física da Hero landing. */
export function ProjectTitleAscii({ source, asciiConfig }: ProjectTitleAsciiProps) {
  return (
    <AsciiInteractionSurface
      source={source}
      layout="inline"
      config={asciiConfig}
    />
  );
}
