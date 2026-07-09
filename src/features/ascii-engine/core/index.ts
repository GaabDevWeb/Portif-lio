/** Core — re-export da implementação ascii-interaction (sem wrappers Next-only). */
export {
  AsciiInteractionEngine,
  AsciiInteractionEngineCore,
  DEFAULT_ASCII_INTERACTION_CONFIG,
  HERO_ASCII_INTERACTION_CONFIG,
  mergeAsciiConfig,
  SurfaceState,
  MouseInfluencer,
} from "@/features/ascii-interaction";

export type {
  AsciiInteractionEngineProps,
  AsciiGridSource,
  AsciiInteractionConfig,
  AsciiInteractionEngineHandle,
  AsciiDebugSnapshot,
  AsciiEngineStats,
  EmitFieldInput,
  FalloffCurve,
  Influencer,
} from "@/features/ascii-interaction";

export * from "@/features/ascii-interaction/image-pipeline";
export * from "@/features/ascii-interaction/animation-pipeline";
