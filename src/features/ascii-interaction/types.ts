/** Curva de atenuação radial de um campo de influência. */
export type FalloffCurve = "gaussian" | "smoothstep" | "inverse";

/** Estados globais que modulam presets da superfície. */
export enum SurfaceState {
  Idle = "idle",
  Hover = "hover",
  Disturbed = "disturbed",
  AudioReactive = "audio-reactive",
  ScrollReactive = "scroll-reactive",
  Dissolving = "dissolving",
}

/** Entrada pública para `emitField`. */
export interface EmitFieldInput {
  x: number;
  y: number;
  radius: number;
  strength: number;
  falloff?: FalloffCurve;
  /** Duração em ms; omitir = campo persistente até `removeField`. */
  duration?: number;
  /** Taxa de decaimento por segundo (0–1). */
  decay?: number;
  velocity?: { x: number; y: number };
  layer?: number;
}

/** Campo de influência interno (com metadados de tempo). */
export interface InfluenceField extends EmitFieldInput {
  id: string;
  falloff: FalloffCurve;
  decay: number;
  createdAt: number;
  expiresAt: number | null;
  active: boolean;
}

/** Preset aplicado por `SurfaceState`. */
export interface SurfaceStatePreset {
  physicsDamping: number;
  springStiffness: number;
  fieldSensitivity: number;
  trailDecay: number;
  trailDeposit: number;
  evolutionRate: number;
  idleBreathAmplitude: number;
}

/** Configuração centralizada da engine. */
export interface AsciiInteractionConfig {
  cellWidth: number;
  cellHeight: number;
  fontFamily: string;
  fontSize: number;
  colorPrimary: string;
  colorDim: string;
  colorAccent: string;
  opacity: number;

  maxCharacters: number;
  layerCount: number;
  parallax: readonly number[];

  defaultFalloff: FalloffCurve;
  maxActiveFields: number;

  radius: number;
  strength: number;
  damping: number;
  spring: number;
  minDistance: number;

  trailLifetime: number;
  trailDecay: number;
  trailRadius: number;
  trailDeposit: number;
  trailLength: number;

  characterSet: string;
  density: number;
  evolutionHysteresis: number;

  /** Restauração elástica pós-interação (ms). */
  restorationMinMs: number;
  restorationMaxMs: number;
  restorationDamping: number;
  restorationSpring: number;
  microOscillationStrength: number;
  energyImpulseScale: number;
  energyTrailScale: number;
  energyVelocityScale: number;
  idleEnergyThreshold: number;
  idleVelocityThreshold: number;
  idleOffsetThreshold: number;
  idleTrailThreshold: number;

  maxFPS: number;
  fixedTimestep: number;
  maxSubSteps: number;
  maxActiveCells: number;

  enableTrail: boolean;
  enableEvolution: boolean;
  enablePhysics: boolean;

  breakpoints: {
    mobile: Partial<AsciiInteractionConfig>;
    tablet: Partial<AsciiInteractionConfig>;
  };
}

/** Handle imperativo exposto pelo componente React. */
export interface AsciiInteractionEngineHandle {
  emitField: (input: EmitFieldInput) => string;
  updateField: (
    id: string,
    patch: Partial<Pick<EmitFieldInput, "x" | "y" | "radius" | "strength" | "velocity">>,
  ) => boolean;
  removeField: (id: string) => void;
  clearFields: () => void;
  setSurfaceState: (state: SurfaceState) => void;
  getSurfaceState: () => SurfaceState;
  destroy: () => void;
}

/** Contrato do renderer (permite WebGL futuro). */
export interface AsciiRenderer {
  resize(width: number, height: number, dpr: number): void;
  setColors(primary: string, dim: string, accent: string): void;
  renderFrame(ctx: RenderFrameContext): void;
  destroy(): void;
}

export interface RenderFrameContext {
  grid: import("@/features/ascii-interaction/grid/character-grid").CharacterGrid;
  dirtyIndices: Uint32Array;
  dirtyCount: number;
  width: number;
  height: number;
  opacity: number;
}

/** Contrato de influencers (mouse, áudio, scroll, …). */
export interface Influencer {
  readonly id: string;
  mount(surface: InfluencerSurface): void;
  unmount(): void;
  update(dt: number): void;
}

export interface InfluencerSurface {
  emitField(input: EmitFieldInput): string;
  updateField(
    id: string,
    patch: Partial<Pick<EmitFieldInput, "x" | "y" | "radius" | "strength" | "velocity">>,
  ): boolean;
  removeField(id: string): void;
  getCanvasElement(): HTMLCanvasElement | null;
  getConfig(): Readonly<AsciiInteractionConfig>;
  getSurfaceState(): SurfaceState;
  isReducedMotion(): boolean;
}
