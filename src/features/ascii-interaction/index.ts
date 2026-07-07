export { AsciiInteractionEngine } from "@/features/ascii-interaction/AsciiInteractionEngine";
export type { AsciiInteractionEngineProps } from "@/features/ascii-interaction/AsciiInteractionEngine";

export { AsciiInteractionEngineCore } from "@/features/ascii-interaction/engine/ascii-interaction-engine-core";

export {
  DEFAULT_ASCII_INTERACTION_CONFIG,
  HERO_ASCII_INTERACTION_CONFIG,
  mergeAsciiConfig,
} from "@/features/ascii-interaction/config";

export type {
  AsciiInteractionConfig,
  AsciiInteractionEngineHandle,
  EmitFieldInput,
  FalloffCurve,
  Influencer,
} from "@/features/ascii-interaction/types";

export { SurfaceState } from "@/features/ascii-interaction/types";

export { MouseInfluencer } from "@/features/ascii-interaction/influence/influencers/mouse-influencer";
