import type { CharacterGrid } from "@/features/ascii-interaction/grid/character-grid";
import type { AsciiInteractionConfig } from "@/features/ascii-interaction/types";
import { clamp } from "@/features/ascii-interaction/utils/math";

/**
 * Evolução e restauração de glifos.
 * Perturbação relativa ao glifo original; retorno gradual conforme energia decai.
 */
export class CharacterEvolution {
  private readonly glyphFloat: Float32Array;
  private readonly excitedIndex: Float32Array;

  constructor(maxCells: number) {
    this.glyphFloat = new Float32Array(maxCells);
    this.excitedIndex = new Float32Array(maxCells);
  }

  init(grid: CharacterGrid): void {
    for (let i = 0; i < grid.count; i += 1) {
      const base = grid.baseGlyphIndex[i]!;
      this.glyphFloat[i] = base;
      this.excitedIndex[i] = base;
    }
  }

  step(
    grid: CharacterGrid,
    config: AsciiInteractionConfig,
    evolutionRate: number,
    cursorSpeed: number,
    dt: number,
  ): void {
    if (!config.enableEvolution) return;

    const setLen = config.characterSet.length - 1;
    const speedBoost = clamp(cursorSpeed / 8, 0, 1);

    for (let a = 0; a < grid.activeCount; a += 1) {
      const i = grid.activeIndices[a]!;
      const baseIdx = grid.baseGlyphIndex[i]!;
      const energy = grid.energy[i]!;
      const trail = grid.trailEnergy[i]!;
      const intensity = grid.intensity[i]!;

      // Índice excitado durante perturbação
      const disturbLevel = clamp(
        intensity * 0.35 + trail * 0.4 + energy * 0.45 + speedBoost * 0.25,
        0,
        1,
      );

      const excitedTarget = Math.round(
        baseIdx + disturbLevel * (setLen - baseIdx),
      );

      const homeBlend = clamp(1 - Math.pow(energy, 0.75), 0, 1);
      const prevExcited = this.excitedIndex[i]!;

      // Decai excitação quando perturbação some
      if (disturbLevel < 0.08) {
        this.excitedIndex[i] +=
          (baseIdx - prevExcited) * Math.min(1, dt * (4 + homeBlend * 6));
      } else if (excitedTarget > prevExcited) {
        this.excitedIndex[i] = excitedTarget;
      } else {
        this.excitedIndex[i] =
          prevExcited + (excitedTarget - prevExcited) * evolutionRate * dt * 30;
      }

      const targetIdx =
        this.excitedIndex[i]! * (1 - homeBlend) + baseIdx * homeBlend;

      const prevFloat = this.glyphFloat[i]!;
      const delta = targetIdx - prevFloat;

      // Velocidade de restauração proporcional à energia (mais lento no final)
      const restoreRate =
        energy > 0.05
          ? evolutionRate * dt * 45
          : evolutionRate * dt * 28 * (1 + homeBlend);

      let step = delta * restoreRate;
      if (Math.abs(delta) > config.evolutionHysteresis * setLen) {
        step = Math.sign(delta) * Math.max(Math.abs(step), 0.15);
      } else if (homeBlend > 0.95) {
        step = delta * 0.18;
      }

      const nextFloat = clamp(prevFloat + step, 0, setLen);
      this.glyphFloat[i] = nextFloat;

      const nextIndex = Math.round(nextFloat);
      if (nextIndex !== grid.glyphIndex[i]) {
        grid.glyphIndex[i] = nextIndex;
        grid.markDirty(i);
      }

      // Alpha retorna ao valor original
      const targetAlpha =
        grid.baseAlpha[i]! +
        disturbLevel * (0.65 - grid.baseAlpha[i]!) * (1 - homeBlend * 0.5);
      const prevAlpha = grid.alpha[i]!;
      const nextAlpha = prevAlpha + (targetAlpha - prevAlpha) * (0.08 + homeBlend * 0.06);
      if (Math.abs(nextAlpha - prevAlpha) > 0.005) {
        grid.alpha[i] = nextAlpha;
        grid.markDirty(i);
      }

      // Quando estabilizado, garante glifo e alpha originais
      if (
        energy < config.idleEnergyThreshold &&
        trail < config.idleTrailThreshold &&
        homeBlend > 0.92
      ) {
        if (grid.glyphIndex[i] !== baseIdx) {
          grid.glyphIndex[i] = baseIdx;
          this.glyphFloat[i] = baseIdx;
          this.excitedIndex[i] = baseIdx;
          grid.markDirty(i);
        }
        grid.alpha[i] = grid.baseAlpha[i]!;
        grid.intensity[i] = grid.baseIntensity[i]!;
      }
    }
  }

  /** Sincroniza estado interno com home após superfície estabilizar. */
  syncAllHome(grid: CharacterGrid): void {
    for (let i = 0; i < grid.count; i += 1) {
      const base = grid.baseGlyphIndex[i]!;
      this.glyphFloat[i] = base;
      this.excitedIndex[i] = base;
      grid.glyphIndex[i] = base;
      grid.alpha[i] = grid.baseAlpha[i]!;
      grid.intensity[i] = grid.baseIntensity[i]!;
    }
  }
}
