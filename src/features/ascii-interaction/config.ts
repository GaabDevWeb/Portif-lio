import type { AsciiInteractionConfig } from "@/features/ascii-interaction/types";

/** Configuração padrão da biblioteca interna. */
export const DEFAULT_ASCII_INTERACTION_CONFIG: AsciiInteractionConfig = {
  cellWidth: 7,
  cellHeight: 12,
  fontFamily: '"Courier New", Courier, monospace',
  fontSize: 11,
  colorPrimary: "#9dff9d",
  colorDim: "#3d6b3d",
  colorAccent: "#c8ffc8",
  opacity: 0.42,

  maxCharacters: 8192,
  layerCount: 3,
  parallax: [0.32, 0.62, 1] as const,

  defaultFalloff: "smoothstep",
  maxActiveFields: 48,

  radius: 110,
  strength: 220,
  damping: 0.84,
  spring: 0.095,
  minDistance: 4,

  trailLifetime: 1400,
  trailDecay: 0.035,
  trailRadius: 36,
  trailDeposit: 0.28,
  trailLength: 16,

  characterSet: " .':;=-+*#%@█",
  density: 1,
  evolutionHysteresis: 0.07,

  restorationMinMs: 800,
  restorationMaxMs: 2000,
  restorationDamping: 0.79,
  restorationSpring: 0.11,
  microOscillationStrength: 0.35,
  energyImpulseScale: 0.42,
  energyTrailScale: 0.28,
  energyVelocityScale: 0.12,
  idleEnergyThreshold: 0.008,
  idleVelocityThreshold: 0.015,
  idleOffsetThreshold: 0.06,
  idleTrailThreshold: 0.02,

  maxFPS: 60,
  fixedTimestep: 1 / 60,
  maxSubSteps: 5,
  maxActiveCells: 6144,

  enableTrail: true,
  enableEvolution: true,
  enablePhysics: true,

  breakpoints: {
    tablet: {
      radius: 85,
      strength: 170,
      trailDeposit: 0.22,
      maxFPS: 50,
      maxActiveCells: 3072,
    },
    mobile: {
      radius: 65,
      strength: 120,
      trailDeposit: 0.15,
      trailDecay: 0.05,
      enableTrail: true,
      maxFPS: 30,
      maxActiveCells: 2048,
      layerCount: 2,
      parallax: [0.45, 1] as const,
    },
  },
};

/** Preset visual da Hero — apenas overrides, sem hardcode na engine. */
export const HERO_ASCII_INTERACTION_CONFIG: Partial<AsciiInteractionConfig> = {
  opacity: 0.38,
  radius: 120,
  strength: 200,
  damping: 0.86,
  spring: 0.088,
  trailDeposit: 0.26,
  trailDecay: 0.032,
  restorationDamping: 0.8,
  restorationSpring: 0.105,
  microOscillationStrength: 0.3,
  cellWidth: 7,
  cellHeight: 12,
  fontSize: 11,
};

/**
 * Mescla config parcial sobre os defaults.
 * Arrays como `parallax` são substituídos por cópia quando fornecidos.
 */
export function mergeAsciiConfig(
  partial?: Partial<AsciiInteractionConfig>,
): AsciiInteractionConfig {
  if (!partial) return { ...DEFAULT_ASCII_INTERACTION_CONFIG };

  return {
    ...DEFAULT_ASCII_INTERACTION_CONFIG,
    ...partial,
    parallax: partial.parallax
      ? [...partial.parallax]
      : [...DEFAULT_ASCII_INTERACTION_CONFIG.parallax],
    breakpoints: {
      mobile: {
        ...DEFAULT_ASCII_INTERACTION_CONFIG.breakpoints.mobile,
        ...partial.breakpoints?.mobile,
      },
      tablet: {
        ...DEFAULT_ASCII_INTERACTION_CONFIG.breakpoints.tablet,
        ...partial.breakpoints?.tablet,
      },
    },
  };
}
