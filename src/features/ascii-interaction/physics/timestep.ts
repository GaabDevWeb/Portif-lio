/** Integrador com timestep fixo e accumulator (Gaffer on Games). */
export class TimestepAccumulator {
  private accumulator = 0;
  private lastTime = 0;
  private initialized = false;

  reset(now: number): void {
    this.accumulator = 0;
    this.lastTime = now;
    this.initialized = true;
  }

  /**
   * Executa `step` quantas vezes couber no fixedDt, até maxSubSteps.
   * Retorna alpha residual [0,1] para interpolação opcional.
   */
  tick(
    now: number,
    fixedDt: number,
    maxSubSteps: number,
    step: (dt: number) => void,
  ): number {
    if (!this.initialized) {
      this.reset(now);
      return 0;
    }

    let frameTime = (now - this.lastTime) / 1000;
    this.lastTime = now;

    if (frameTime > 0.25) frameTime = 0.25;

    this.accumulator += frameTime;

    let steps = 0;
    while (this.accumulator >= fixedDt && steps < maxSubSteps) {
      step(fixedDt);
      this.accumulator -= fixedDt;
      steps += 1;
    }

    return this.accumulator / fixedDt;
  }
}
