import type { AsciiInteractionConfig } from "@/features/ascii-interaction/types";
import { mergeAsciiConfig } from "@/features/ascii-interaction/config";

type Breakpoint = "desktop" | "tablet" | "mobile";

function detectBreakpoint(width: number): Breakpoint {
  if (width < 640) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}

/**
 * Resolve config efetiva conforme viewport e `prefers-reduced-motion`.
 * Reduced motion desliga trail/física agressiva via flags.
 */
export function resolveResponsiveConfig(
  base: AsciiInteractionConfig,
  width: number,
  reducedMotion: boolean,
): AsciiInteractionConfig {
  const bp = detectBreakpoint(width);
  let config = { ...base };

  if (bp === "tablet") {
    config = mergeAsciiConfig({ ...config, ...base.breakpoints.tablet });
  } else if (bp === "mobile") {
    config = mergeAsciiConfig({ ...config, ...base.breakpoints.mobile });
  }

  if (reducedMotion) {
    config = {
      ...config,
      enablePhysics: false,
      enableTrail: false,
      enableEvolution: true,
      strength: config.strength * 0.15,
      radius: config.radius * 0.6,
      trailDeposit: 0,
      damping: 0.92,
      spring: 0.04,
      maxFPS: 30,
    };
  }

  return config;
}
