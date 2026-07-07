/** Estado suavizado do cursor em coordenadas de canvas. */
export class CursorController {
  x = 0;
  y = 0;
  vx = 0;
  vy = 0;
  active = false;
  private targetX = 0;
  private targetY = 0;
  private readonly smooth = 0.22;

  setPosition(x: number, y: number): void {
    this.targetX = x;
    this.targetY = y;
    this.active = true;
  }

  deactivate(): void {
    this.active = false;
  }

  update(): void {
    if (!this.active) {
      this.vx *= 0.85;
      this.vy *= 0.85;
      return;
    }

    const prevX = this.x;
    const prevY = this.y;

    this.x += (this.targetX - this.x) * this.smooth;
    this.y += (this.targetY - this.y) * this.smooth;

    this.vx = this.x - prevX;
    this.vy = this.y - prevY;
  }

  get speed(): number {
    return Math.hypot(this.vx, this.vy);
  }
}
