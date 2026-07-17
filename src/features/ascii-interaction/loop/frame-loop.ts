/** Loop rAF com budget de FPS e callback estável. */
export class FrameLoop {
  private rafId = 0;
  private running = false;
  private lastFrameTime = 0;
  private minFrameInterval = 0;

  start(onFrame: (now: number) => void): void {
    if (this.running) return;
    this.running = true;
    this.lastFrameTime = 0;

    const loop = (now: number) => {
      if (!this.running) return;

      if (this.minFrameInterval > 0 && this.lastFrameTime > 0) {
        const elapsed = now - this.lastFrameTime;
        if (elapsed < this.minFrameInterval) {
          this.rafId = requestAnimationFrame(loop);
          return;
        }
      }

      this.lastFrameTime = now;
      onFrame(now);
      this.rafId = requestAnimationFrame(loop);
    };

    this.rafId = requestAnimationFrame(loop);
  }

  stop(): void {
    this.running = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }
  }

  setMaxFPS(maxFPS: number): void {
    this.minFrameInterval = maxFPS > 0 ? 1000 / maxFPS : 0;
  }
}
