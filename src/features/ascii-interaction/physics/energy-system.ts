import type { CharacterGrid } from "@/features/ascii-interaction/grid/character-grid";
import type { AsciiInteractionConfig } from "@/features/ascii-interaction/types";
import { clamp } from "@/features/ascii-interaction/utils/math";

/**
 * Energia residual por célula.
 * Aumenta com influência, decai gradualmente (800–2000 ms conforme pico).
 * Nunca zera instantaneamente.
 */
export class EnergySystem {
  /** Impulsiona energia a partir de força externa e trail. */
  applyInfluence(
    grid: CharacterGrid,
    index: number,
    forceIntensity: number,
    config: AsciiInteractionConfig,
  ): void {
    const trail = grid.trailEnergy[index]!;
    const influenced = forceIntensity > 0.02;

    // Velocidade só impulsiona energia durante influência ativa —
    // evita re-alimentar energia durante oscilação de retorno.
    const vel = influenced
      ? Math.hypot(grid.velX[index]!, grid.velY[index]!)
      : 0;

    const impulse =
      forceIntensity * config.energyImpulseScale +
      trail * config.energyTrailScale +
      vel * config.energyVelocityScale;

    if (impulse < 0.0005) return;

    const prev = grid.energy[index]!;
    const next = clamp(prev + impulse, 0, 1);
    grid.energy[index] = next;

    if (next > grid.peakEnergy[index]!) {
      grid.peakEnergy[index] = next;
      const t = clamp(next, 0, 1);
      grid.restorationMs[index] =
        config.restorationMinMs +
        t * (config.restorationMaxMs - config.restorationMinMs);
    }
  }

  /** Decaimento contínuo — taxa inversamente proporcional à duração de restauração. */
  decay(grid: CharacterGrid, index: number, dt: number): void {
    const energy = grid.energy[index]!;
    if (energy <= CONFIG_FLOOR) return;

    const displacement = Math.hypot(grid.offsetX[index]!, grid.offsetY[index]!);
    // Enquanto deslocado, energia decai mais devagar — garante tempo para retorno físico.
    const displacementHold = clamp(displacement / 12, 0, 1);
    const durationSec =
      Math.max(grid.restorationMs[index]! / 1000, 0.4) * (1 + displacementHold * 0.8);

    const decayFactor = Math.exp((-4.6 * dt) / durationSec);
    const next = energy * decayFactor;

    grid.energy[index] = next < CONFIG_FLOOR ? 0 : next;

    if (grid.energy[index] === 0) {
      grid.peakEnergy[index] = 0;
    }
  }
}

const CONFIG_FLOOR = 0.004;

/** Célula ainda não voltou ao estado original. */
export function isCellUnsettled(
  grid: CharacterGrid,
  index: number,
  config: AsciiInteractionConfig,
): boolean {
  return (
    grid.energy[index]! >= config.idleEnergyThreshold ||
    Math.abs(grid.velX[index]!) >= config.idleVelocityThreshold ||
    Math.abs(grid.velY[index]!) >= config.idleVelocityThreshold ||
    Math.abs(grid.offsetX[index]!) >= config.idleOffsetThreshold ||
    Math.abs(grid.offsetY[index]!) >= config.idleOffsetThreshold ||
    grid.trailEnergy[index]! >= config.idleTrailThreshold ||
    grid.glyphIndex[index] !== grid.baseGlyphIndex[index] ||
    Math.abs(grid.intensity[index]! - grid.baseIntensity[index]!) >= 0.015 ||
    Math.abs(grid.alpha[index]! - grid.baseAlpha[index]!) >= 0.02
  );
}

export function isCellSettled(
  grid: CharacterGrid,
  index: number,
  config: AsciiInteractionConfig,
): boolean {
  return !isCellUnsettled(grid, index, config);
}

/** Varre todas as células — sem amostragem (evita falso idle). */
export function isSurfaceStable(
  grid: CharacterGrid,
  config: AsciiInteractionConfig,
): boolean {
  for (let i = 0; i < grid.count; i += 1) {
    if (isCellUnsettled(grid, i, config)) return false;
  }
  return true;
}

export function countUnsettledCells(
  grid: CharacterGrid,
  config: AsciiInteractionConfig,
): number {
  let n = 0;
  for (let i = 0; i < grid.count; i += 1) {
    if (isCellUnsettled(grid, i, config)) n += 1;
  }
  return n;
}
