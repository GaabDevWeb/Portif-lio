export { AsciiInteractionEngine } from "@/features/ascii-interaction/AsciiInteractionEngine";
export type { AsciiInteractionEngineProps } from "@/features/ascii-interaction/AsciiInteractionEngine";

export { AsciiInteractionSurface } from "@/features/ascii-interaction/components/ascii-interaction-surface";
export type { AsciiInteractionSurfaceProps } from "@/features/ascii-interaction/components/ascii-interaction-surface";

export { AsciiAnimationHero } from "@/features/ascii-interaction/components/ascii-animation-hero";

export { AsciiInteractionEngineCore } from "@/features/ascii-interaction/engine/ascii-interaction-engine-core";

export type { AsciiGridSource } from "@/features/ascii-interaction/grid/character-grid";

export {
  DEFAULT_ASCII_INTERACTION_CONFIG,
  HERO_ASCII_INTERACTION_CONFIG,
  mergeAsciiConfig,
} from "@/features/ascii-interaction/config";

export type {
  AsciiInteractionConfig,
  AsciiInteractionDebugMetrics,
  AsciiInteractionEngineHandle,
  AsciiDebugSnapshot,
  AsciiEngineStats,
  EmitFieldInput,
  FalloffCurve,
  Influencer,
} from "@/features/ascii-interaction/types";

export { SurfaceState } from "@/features/ascii-interaction/types";

export { MouseInfluencer } from "@/features/ascii-interaction/influence/influencers/mouse-influencer";

export * from "@/features/ascii-interaction/image-pipeline";

export * from "@/features/ascii-interaction/animation-pipeline";
