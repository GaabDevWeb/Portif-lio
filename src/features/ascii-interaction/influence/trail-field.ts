import type { CharacterGrid } from "@/features/ascii-interaction/grid/character-grid";
import type { AsciiInteractionConfig } from "@/features/ascii-interaction/types";
import { clamp } from "@/features/ascii-interaction/utils/math";

/**
 * Campo de rastro tipo fumaça — deposita energia na matriz, não partículas.
 * A energia decai e influencia evolução de glifos + física leve.
 */
export class TrailField {
  private lastX = -1;
  private lastY = -1;
  private cursorSpeed = 0;

  reset(): void {
    this.lastX = -1;
    this.lastY = -1;
    this.cursorSpeed = 0;
  }

  setCursorMotion(x: number, y: number, vx: number, vy: number): void {
    if (this.lastX >= 0) {
      const dx = x - this.lastX;
      const dy = y - this.lastY;
      this.cursorSpeed = Math.hypot(dx, dy) + Math.hypot(vx, vy) * 0.016;
    }
    this.lastX = x;
    this.lastY = y;
  }

  /** Deposita energia nas células próximas ao cursor. */
  deposit(
    grid: CharacterGrid,
    x: number,
    y: number,
    config: AsciiInteractionConfig,
    depositScale: number,
    activeRadius: number,
  ): void {
    const radius = config.trailRadius;
    const radiusSq = radius * radius;
    const speedFactor = clamp(this.cursorSpeed / 12, 0.15, 1.4);
    const amount = config.trailDeposit * depositScale * speedFactor;

    for (let i = 0; i < grid.count; i += 1) {
      const px = grid.getPosX(i);
      const py = grid.getPosY(i);
      const dx = px - x;
      const dy = py - y;
      const d2 = dx * dx + dy * dy;

      if (d2 > radiusSq) continue;
      if (d2 > activeRadius * activeRadius) continue;

      const t = Math.sqrt(d2) / radius;
      const falloff = 1 - t * t;
      const prev = grid.trailEnergy[i]!;
      grid.trailEnergy[i] = clamp(prev + amount * falloff, 0, 1);
      grid.markDirty(i);
    }
  }

  /**
   * Evaporação do trail.
   * Com cursor ativo: decai na região próxima.
   * Sem cursor: decai globalmente (corrige trail preso longe do ponteiro).
   */
  evaporate(
    grid: CharacterGrid,
    decay: number,
    dt: number,
    nearRadius: number,
    cx: number,
    cy: number,
    cursorActive: boolean,
  ): void {
    const localFactor = Math.pow(1 - decay, dt * 60);
    const globalFactor = Math.pow(1 - decay * 2.2, dt * 60);
    const nearRadiusSq = nearRadius * nearRadius * 4;

    for (let i = 0; i < grid.count; i += 1) {
      const e = grid.trailEnergy[i]!;
      if (e <= 0.001) {
        if (e > 0) grid.trailEnergy[i] = 0;
        continue;
      }

      let factor = globalFactor;
      if (cursorActive) {
        const px = grid.getPosX(i);
        const py = grid.getPosY(i);
        const dx = px - cx;
        const dy = py - cy;
        factor = dx * dx + dy * dy <= nearRadiusSq ? localFactor : globalFactor;
      }

      const next = e * factor;
      grid.trailEnergy[i] = next < 0.001 ? 0 : next;
      if (Math.abs(e - next) > 0.002) {
        grid.markDirty(i);
      }
    }
  }
}
