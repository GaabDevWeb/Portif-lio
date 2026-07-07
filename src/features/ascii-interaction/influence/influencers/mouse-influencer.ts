import type { Influencer, InfluencerSurface } from "@/features/ascii-interaction/types";
import { CursorController } from "@/features/ascii-interaction/cursor/cursor-controller";
import { SurfaceState } from "@/features/ascii-interaction/types";

/** Influencer de mouse — emite campo radial via Influence Layer. */
export class MouseInfluencer implements Influencer {
  readonly id = "mouse";

  private surface: InfluencerSurface | null = null;
  private readonly cursor = new CursorController();
  private fieldId: string | null = null;
  private boundMove: ((e: PointerEvent) => void) | null = null;
  private boundLeave: (() => void) | null = null;
  private boundEnter: ((e: PointerEvent) => void) | null = null;

  getCursor(): CursorController {
    return this.cursor;
  }

  mount(surface: InfluencerSurface): void {
    this.surface = surface;
    const canvas = surface.getCanvasElement();
    if (!canvas) return;

    this.boundMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      this.cursor.setPosition(e.clientX - rect.left, e.clientY - rect.top);
    };

    this.boundLeave = () => {
      this.cursor.deactivate();
      if (this.fieldId) {
        surface.removeField(this.fieldId);
        this.fieldId = null;
      }
    };

    this.boundEnter = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      this.cursor.setPosition(e.clientX - rect.left, e.clientY - rect.top);
      this.cursor.active = true;
    };

    canvas.addEventListener("pointermove", this.boundMove);
    canvas.addEventListener("pointerleave", this.boundLeave);
    canvas.addEventListener("pointerenter", this.boundEnter);
  }

  unmount(): void {
    const canvas = this.surface?.getCanvasElement();
    if (canvas && this.boundMove) {
      canvas.removeEventListener("pointermove", this.boundMove);
    }
    if (canvas && this.boundLeave) {
      canvas.removeEventListener("pointerleave", this.boundLeave);
    }
    if (canvas && this.boundEnter) {
      canvas.removeEventListener("pointerenter", this.boundEnter);
    }

    if (this.fieldId && this.surface) {
      this.surface.removeField(this.fieldId);
    }

    this.boundMove = null;
    this.boundLeave = null;
    this.boundEnter = null;
    this.fieldId = null;
    this.surface = null;
  }

  update(): void {
    if (!this.surface || this.surface.isReducedMotion()) return;

    this.cursor.update();
    if (!this.cursor.active) return;

    const config = this.surface.getConfig();
    const state = this.surface.getSurfaceState();
    const sensitivity =
      state === SurfaceState.Hover || state === SurfaceState.Disturbed ? 1.1 : 1;

    const patch = {
      x: this.cursor.x,
      y: this.cursor.y,
      radius: config.radius,
      strength: config.strength * sensitivity,
      velocity: { x: this.cursor.vx * 60, y: this.cursor.vy * 60 },
    };

    if (this.fieldId) {
      const updated = this.surface.updateField(this.fieldId, patch);
      if (updated) return;
    }

    this.fieldId = this.surface.emitField({
      ...patch,
      falloff: config.defaultFalloff,
    });
  }
}
