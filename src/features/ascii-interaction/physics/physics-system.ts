import type { CharacterGrid } from "@/features/ascii-interaction/grid/character-grid";
import type { AsciiInteractionConfig } from "@/features/ascii-interaction/types";
import type { SurfaceStatePreset } from "@/features/ascii-interaction/types";
import { clamp } from "@/features/ascii-interaction/utils/math";
import { EnergySystem } from "@/features/ascii-interaction/physics/energy-system";

export interface ForceSample {
  fx: number;
  fy: number;
  intensity: number;
}

/**
 * Física por caractere com retorno elástico à home position (offset → 0).
 * Overshoot via amortecimento subcrítico durante restauração.
 */
export class PhysicsSystem {
  private readonly energy = new EnergySystem();

  step(
    grid: CharacterGrid,
    config: AsciiInteractionConfig,
    preset: SurfaceStatePreset,
    parallax: readonly number[],
    forces: ForceSample[],
    dt: number,
    reducedMotion: boolean,
  ): void {
    for (let a = 0; a < grid.activeCount; a += 1) {
      const i = grid.activeIndices[a]!;
      const layerScale = parallax[grid.layer[i]!] ?? 1;
      const force = forces[i] ?? { fx: 0, fy: 0, intensity: 0 };

      let fx = force.fx * layerScale;
      let fy = force.fy * layerScale;

      const influenced = force.intensity > 0.02;
      const residual = grid.energy[i]! > config.idleEnergyThreshold;

      if (!reducedMotion && config.enablePhysics) {
        const restoring = !influenced && (residual || this.isDisplaced(grid, i, config));

        const springBase = restoring ? config.restorationSpring : config.spring;
        let springK = springBase * (preset.springStiffness / 0.07);

        const displacement = Math.hypot(grid.offsetX[i]!, grid.offsetY[i]!);
        if (restoring && displacement > config.idleOffsetThreshold) {
          springK *= 1 + clamp(displacement / 8, 0, 1.2);
        }

        // Mola sempre puxa de volta à home (offset 0)
        fx += -springK * grid.offsetX[i]!;
        fy += -springK * grid.offsetY[i]!;

        // Amortecimento subcrítico durante restauração → overshoot orgânico
        let damping = config.damping * (preset.physicsDamping / 0.88);
        if (restoring) {
          const energyFactor = clamp(grid.energy[i]!, 0, 1);
          damping =
            config.restorationDamping +
            (1 - energyFactor) * (config.damping - config.restorationDamping) * 0.5;
        }

        // Micro-oscilação residual enquanto energia > 0
        if (residual && config.microOscillationStrength > 0) {
          const w = grid.age[i]! * 14 + i * 0.37;
          const amp = grid.energy[i]! * config.microOscillationStrength;
          fx += Math.sin(w) * amp;
          fy += Math.cos(w * 0.83) * amp * 0.65;
        }

        grid.velX[i] = (grid.velX[i]! + fx * dt) * damping;
        grid.velY[i] = (grid.velY[i]! + fy * dt) * damping;
        grid.offsetX[i] = grid.offsetX[i]! + grid.velX[i]! * dt;
        grid.offsetY[i] = grid.offsetY[i]! + grid.velY[i]! * dt;
      } else if (reducedMotion) {
        grid.velX[i] = grid.velX[i]! * 0.9;
        grid.velY[i] = grid.velY[i]! * 0.9;
        grid.offsetX[i] = grid.offsetX[i]! * 0.96;
        grid.offsetY[i] = grid.offsetY[i]! * 0.96;
      }

      grid.accelX[i] = fx;
      grid.accelY[i] = fy;

      this.energy.applyInfluence(grid, i, force.intensity, config);
      this.energy.decay(grid, i, dt);

      const disturb =
        force.intensity + grid.trailEnergy[i]! * 0.5 + grid.energy[i]! * 0.35;
      const targetIntensity = grid.baseIntensity[i]! + disturb * (1 - grid.energy[i]! * 0.25);
      const blendRate = 0.12 + grid.energy[i]! * 0.18;
      grid.intensity[i] = clamp(
        grid.intensity[i]! + (targetIntensity - grid.intensity[i]!) * blendRate,
        grid.baseIntensity[i]!,
        1,
      );

      grid.age[i] = grid.age[i]! + dt;

      if (this.cellNeedsRender(grid, i, config)) {
        grid.markDirty(i);
      }
    }
  }

  /** Respiração idle — só quando superfície 100% estabilizada. */
  idleBreath(grid: CharacterGrid, preset: SurfaceStatePreset): void {
    if (preset.idleBreathAmplitude <= 0) return;

    const amp = preset.idleBreathAmplitude;
    const t = performance.now() * 0.001;

    for (let i = 0; i < grid.count; i += 1) {
      grid.velX[i] = 0;
      grid.velY[i] = 0;
      grid.energy[i] = 0;
      grid.trailEnergy[i] = 0;

      const w = t * 1.4 + i * 0.11;
      grid.offsetX[i] = Math.sin(w) * amp * 0.4;
      grid.offsetY[i] = Math.cos(w * 0.7) * amp;
      grid.markDirty(i);
    }
  }

  private isDisplaced(
    grid: CharacterGrid,
    index: number,
    config: AsciiInteractionConfig,
  ): boolean {
    return (
      Math.abs(grid.offsetX[index]!) > config.idleOffsetThreshold ||
      Math.abs(grid.offsetY[index]!) > config.idleOffsetThreshold ||
      Math.abs(grid.velX[index]!) > config.idleVelocityThreshold ||
      Math.abs(grid.velY[index]!) > config.idleVelocityThreshold
    );
  }

  private cellNeedsRender(
    grid: CharacterGrid,
    index: number,
    config: AsciiInteractionConfig,
  ): boolean {
    return (
      Math.abs(grid.velX[index]!) > config.idleVelocityThreshold ||
      Math.abs(grid.velY[index]!) > config.idleVelocityThreshold ||
      Math.abs(grid.offsetX[index]!) > config.idleOffsetThreshold ||
      Math.abs(grid.offsetY[index]!) > config.idleOffsetThreshold ||
      grid.energy[index]! > config.idleEnergyThreshold ||
      grid.trailEnergy[index]! > config.idleTrailThreshold ||
      Math.abs(grid.glyphIndex[index]! - grid.baseGlyphIndex[index]!) > 0
    );
  }
}
