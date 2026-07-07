import type { AsciiInteractionConfig } from "@/features/ascii-interaction/types";
import { HERO_ASCII_INTERACTION_CONFIG } from "@/features/ascii-interaction/config";

/** Preset ASCII interativo para páginas de projeto. */
export const PROJECT_ASCII_DEFAULTS: Partial<AsciiInteractionConfig> = {
  ...HERO_ASCII_INTERACTION_CONFIG,
  opacity: 0.4,
  radius: 115,
  strength: 190,
};

export const HORIZONTAL_SCROLL = {
  scrub: 1,
  anticipatePin: 1,
  panelMinWidth: "min(85vw, 640px)",
  panelGap: "clamp(2rem, 5vw, 4rem)",
} as const;

export const MOTION = {
  heroTitle: { duration: 0.7, stagger: 0.1, ease: "power2.out" },
  panelEnter: { duration: 0.5, ease: "power2.out" },
  footerReveal: { duration: 0.8, ease: "power2.out" },
} as const;
