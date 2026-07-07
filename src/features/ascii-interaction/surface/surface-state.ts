import type { AsciiInteractionConfig, SurfaceStatePreset } from "@/features/ascii-interaction/types";
import { SurfaceState } from "@/features/ascii-interaction/types";
import { clamp } from "@/features/ascii-interaction/utils/math";

const PRESETS: Record<SurfaceState, SurfaceStatePreset> = {
  [SurfaceState.Idle]: {
    physicsDamping: 0.88,
    springStiffness: 0.07,
    fieldSensitivity: 0.85,
    trailDecay: 0.04,
    trailDeposit: 0.2,
    evolutionRate: 0.35,
    idleBreathAmplitude: 0.012,
  },
  [SurfaceState.Hover]: {
    physicsDamping: 0.84,
    springStiffness: 0.095,
    fieldSensitivity: 1.15,
    trailDecay: 0.032,
    trailDeposit: 0.28,
    evolutionRate: 0.55,
    idleBreathAmplitude: 0,
  },
  [SurfaceState.Disturbed]: {
    physicsDamping: 0.82,
    springStiffness: 0.1,
    fieldSensitivity: 0.9,
    trailDecay: 0.034,
    trailDeposit: 0.2,
    evolutionRate: 0.62,
    idleBreathAmplitude: 0,
  },
  [SurfaceState.AudioReactive]: {
    physicsDamping: 0.83,
    springStiffness: 0.09,
    fieldSensitivity: 1.2,
    trailDecay: 0.025,
    trailDeposit: 0.4,
    evolutionRate: 0.85,
    idleBreathAmplitude: 0.02,
  },
  [SurfaceState.ScrollReactive]: {
    physicsDamping: 0.86,
    springStiffness: 0.08,
    fieldSensitivity: 0.95,
    trailDecay: 0.038,
    trailDeposit: 0.18,
    evolutionRate: 0.45,
    idleBreathAmplitude: 0,
  },
  [SurfaceState.Dissolving]: {
    physicsDamping: 0.9,
    springStiffness: 0.05,
    fieldSensitivity: 0.6,
    trailDecay: 0.06,
    trailDeposit: 0.1,
    evolutionRate: 0.25,
    idleBreathAmplitude: 0.008,
  },
};

/** Gerencia estado global da superfície com transição suave entre presets. */
export class SurfaceStateController {
  private current = SurfaceState.Idle;
  private target = SurfaceState.Idle;
  private blend = 1;
  private readonly blendSpeed = 4;

  readonly live: SurfaceStatePreset = { ...PRESETS[SurfaceState.Idle] };

  get state(): SurfaceState {
    return this.current;
  }

  setState(next: SurfaceState): void {
    if (next === this.target) return;
    this.target = next;
    this.blend = 0;
  }

  update(dt: number, time: number): void {
    if (this.blend < 1) {
      this.blend = clamp(this.blend + dt * this.blendSpeed, 0, 1);
      if (this.blend >= 1) {
        this.current = this.target;
      }
    }

    const from = PRESETS[this.current];
    const to = PRESETS[this.target];
    const t = this.blend;

    this.live.physicsDamping = from.physicsDamping + (to.physicsDamping - from.physicsDamping) * t;
    this.live.springStiffness = from.springStiffness + (to.springStiffness - from.springStiffness) * t;
    this.live.fieldSensitivity = from.fieldSensitivity + (to.fieldSensitivity - from.fieldSensitivity) * t;
    this.live.trailDecay = from.trailDecay + (to.trailDecay - from.trailDecay) * t;
    this.live.trailDeposit = from.trailDeposit + (to.trailDeposit - from.trailDeposit) * t;
    this.live.evolutionRate = from.evolutionRate + (to.evolutionRate - from.evolutionRate) * t;
    this.live.idleBreathAmplitude = from.idleBreathAmplitude + (to.idleBreathAmplitude - from.idleBreathAmplitude) * t;

    // Respiração idle — micro-offset aplicado externamente via time
    void time;
  }

  applyConfigOverrides(config: AsciiInteractionConfig): AsciiInteractionConfig {
    return {
      ...config,
      damping: config.damping * (this.live.physicsDamping / PRESETS[SurfaceState.Idle].physicsDamping),
      spring: config.spring * (this.live.springStiffness / PRESETS[SurfaceState.Idle].springStiffness),
      trailDecay: config.trailDecay * (this.live.trailDecay / PRESETS[SurfaceState.Idle].trailDecay),
      trailDeposit: config.trailDeposit * (this.live.trailDeposit / PRESETS[SurfaceState.Idle].trailDeposit),
    };
  }
}
