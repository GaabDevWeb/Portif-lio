import type { AsciiInteractionConfig } from "@/features/ascii-interaction/types";
import { mergeAsciiConfig } from "@/features/ascii-interaction/config";

export interface AsciiPreset {
  id: string;
  label: string;
  description: string;
  config: Partial<AsciiInteractionConfig>;
}

export const ASCII_PRESETS: AsciiPreset[] = [
  {
    id: "default",
    label: "Default",
    description: "Baseline da engine",
    config: {},
  },
  {
    id: "smoke",
    label: "Smoke",
    description: "Trail longo, movimento suave",
    config: {
      trailDecay: 0.018,
      trailDeposit: 0.35,
      trailRadius: 48,
      damping: 0.9,
      spring: 0.06,
      opacity: 0.32,
      characterSet: " .':;=-+*#%@█",
    },
  },
  {
    id: "magnetic",
    label: "Magnetic",
    description: "Atração forte ao cursor",
    config: {
      radius: 160,
      strength: 320,
      spring: 0.14,
      damping: 0.78,
      minDistance: 2,
    },
  },
  {
    id: "fluid",
    label: "Fluid",
    description: "Inércia alta, retorno lento",
    config: {
      damping: 0.92,
      spring: 0.045,
      restorationDamping: 0.88,
      restorationSpring: 0.06,
      trailDecay: 0.025,
    },
  },
  {
    id: "ghost",
    label: "Ghost",
    description: "Baixa opacidade, perturbação sutil",
    config: {
      opacity: 0.22,
      strength: 120,
      radius: 90,
      microOscillationStrength: 0.55,
      evolutionHysteresis: 0.12,
    },
  },
  {
    id: "crt",
    label: "CRT",
    description: "Scanlines visuais, phosphor intenso",
    config: {
      colorPrimary: "#7dff7d",
      colorDim: "#1a3d1a",
      colorAccent: "#e8ffe8",
      opacity: 0.48,
      fontSize: 10,
      cellHeight: 11,
      trailDeposit: 0.2,
    },
  },
  {
    id: "heavy",
    label: "Heavy",
    description: "Massa alta, movimento pesado",
    config: {
      damping: 0.72,
      spring: 0.18,
      strength: 380,
      radius: 140,
      restorationSpring: 0.16,
      energyImpulseScale: 0.65,
    },
  },
  {
    id: "minimal",
    label: "Minimal",
    description: "Poucos efeitos, performance máxima",
    config: {
      enableTrail: false,
      enableEvolution: false,
      layerCount: 1,
      parallax: [1],
      opacity: 0.35,
      maxActiveCells: 2048,
    },
  },
  {
    id: "chaos",
    label: "Chaos",
    description: "Alta energia e evolução agressiva",
    config: {
      strength: 420,
      spring: 0.16,
      damping: 0.7,
      evolutionHysteresis: 0.02,
      energyImpulseScale: 0.75,
      microOscillationStrength: 0.6,
      characterSet: ".:;=-+*#%@█",
    },
  },
  {
    id: "silk",
    label: "Silk",
    description: "Movimento sedoso e contínuo",
    config: {
      damping: 0.91,
      spring: 0.07,
      trailDecay: 0.028,
      trailDeposit: 0.3,
      restorationDamping: 0.86,
      restorationSpring: 0.08,
    },
  },
  {
    id: "matrix",
    label: "Matrix",
    description: "Conjunto binário, verde intenso",
    config: {
      characterSet: " 01",
      colorPrimary: "#00ff41",
      colorDim: "#003b0f",
      colorAccent: "#b8ffcc",
      opacity: 0.5,
      trailDecay: 0.04,
    },
  },
  {
    id: "cyber",
    label: "Cyber",
    description: "Ciano/magenta, trail curto",
    config: {
      colorPrimary: "#00e5ff",
      colorDim: "#0a2a33",
      colorAccent: "#ff2bd6",
      trailLifetime: 800,
      trailDecay: 0.055,
      radius: 100,
    },
  },
  {
    id: "organic",
    label: "Organic",
    description: "Respiração idle pronunciada",
    config: {
      microOscillationStrength: 0.65,
      idleEnergyThreshold: 0.004,
      idleVelocityThreshold: 0.008,
      damping: 0.86,
      spring: 0.085,
      evolutionHysteresis: 0.09,
    },
  },
];

export const CHARACTER_SETS: Record<string, string> = {
  default: " .':;=-+*#%@█",
  minimal: " .:+#@",
  blocks: " ░▒▓█",
  matrix: " 01",
  cyber: " .:-=+*#@",
  dense: ".:;=-+*#%@█",
  sparse: " .·'",
};

export function getPresetById(id: string): AsciiPreset | undefined {
  return ASCII_PRESETS.find((p) => p.id === id);
}

export function applyPreset(
  presetId: string,
  base?: Partial<AsciiInteractionConfig>,
): AsciiInteractionConfig {
  const preset = getPresetById(presetId);
  return mergeAsciiConfig({ ...preset?.config, ...base });
}
