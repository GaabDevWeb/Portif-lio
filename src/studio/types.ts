import type { AsciiInteractionConfig } from "@/features/ascii-interaction/types";

export interface LabDebugOptions {
  enabled: boolean;
  showGrid: boolean;
  showBoundingBoxes: boolean;
  showInfluenceRadius: boolean;
  showActiveCells: boolean;
  showVectors: boolean;
  showTrail: boolean;
}

export interface AsciiLabState {
  config: AsciiInteractionConfig;
  activePreset: string;
  scenarioId: string;
  stressMultiplier: number;
  splitView: boolean;
  splitPresetA: string;
  splitPresetB: string;
  debug: LabDebugOptions;
}

export const DEFAULT_DEBUG_OPTIONS: LabDebugOptions = {
  enabled: false,
  showGrid: true,
  showBoundingBoxes: false,
  showInfluenceRadius: true,
  showActiveCells: true,
  showVectors: false,
  showTrail: false,
};

export type ConfigKey = keyof AsciiInteractionConfig;
