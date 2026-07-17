import type { EmitFieldInput, FalloffCurve, InfluenceField } from "@/features/ascii-interaction/types";
import { evaluateFalloff, nextFieldId } from "@/features/ascii-interaction/utils/math";
import type { AsciiInteractionConfig } from "@/features/ascii-interaction/types";

/** Camada de influência: acumula campos emitidos por qualquer fonte. */
export class InfluenceLayer {
  private readonly fields: InfluenceField[] = [];
  private readonly pool: InfluenceField[] = [];

  constructor(private readonly config: AsciiInteractionConfig) {
    for (let i = 0; i < config.maxActiveFields; i += 1) {
      this.pool.push(this.createEmptyField());
    }
  }

  private createEmptyField(): InfluenceField {
    return {
      id: "",
      x: 0,
      y: 0,
      radius: 0,
      strength: 0,
      falloff: "smoothstep",
      decay: 0,
      duration: 0,
      createdAt: 0,
      expiresAt: null,
      active: false,
    };
  }

  emit(input: EmitFieldInput, now: number): string {
    const field = this.pool.pop() ?? this.createEmptyField();
    const id = nextFieldId();

    field.id = id;
    field.x = input.x;
    field.y = input.y;
    field.radius = input.radius;
    field.strength = input.strength;
    field.falloff = input.falloff ?? this.config.defaultFalloff;
    field.decay = input.decay ?? 0;
    field.velocity = input.velocity;
    field.layer = input.layer;
    field.createdAt = now;
    field.expiresAt =
      input.duration != null && Number.isFinite(input.duration)
        ? now + input.duration
        : null;
    field.active = true;

    this.fields.push(field);
    return id;
  }

  remove(id: string): void {
    const idx = this.fields.findIndex((f) => f.id === id);
    if (idx < 0) return;
    const [removed] = this.fields.splice(idx, 1);
    removed.active = false;
    this.pool.push(removed);
  }

  clear(): void {
    while (this.fields.length > 0) {
      const f = this.fields.pop()!;
      f.active = false;
      this.pool.push(f);
    }
  }

  update(now: number, dt: number): void {
    for (let i = this.fields.length - 1; i >= 0; i -= 1) {
      const f = this.fields[i]!;

      if (f.expiresAt != null && now >= f.expiresAt) {
        this.remove(f.id);
        continue;
      }

      if (f.decay > 0) {
        f.strength *= Math.max(0, 1 - f.decay * dt);
        if (f.strength < 0.5) {
          this.remove(f.id);
        }
      }

      if (f.velocity) {
        f.x += f.velocity.x * dt;
        f.y += f.velocity.y * dt;
      }
    }
  }

  get activeFields(): readonly InfluenceField[] {
    return this.fields;
  }

  /** Atualiza um campo existente sem realocar (ex.: cursor por frame). */
  updateField(
    id: string,
    patch: Partial<Pick<InfluenceField, "x" | "y" | "radius" | "strength" | "velocity">>,
  ): boolean {
    const field = this.fields.find((f) => f.id === id);
    if (!field) return false;
    if (patch.x != null) field.x = patch.x;
    if (patch.y != null) field.y = patch.y;
    if (patch.radius != null) field.radius = patch.radius;
    if (patch.strength != null) field.strength = patch.strength;
    if (patch.velocity != null) field.velocity = patch.velocity;
    return true;
  }

  /** Força de repulsão + intensidade em (px, py). */
  sample(px: number, py: number, sensitivity: number): { fx: number; fy: number; intensity: number } {
    let fx = 0;
    let fy = 0;
    let intensity = 0;

    for (let i = 0; i < this.fields.length; i += 1) {
      const f = this.fields[i]!;
      const dx = px - f.x;
      const dy = py - f.y;
      const distSq = dx * dx + dy * dy;
      const radius = f.radius;

      if (distSq > radius * radius) continue;

      const dist = Math.sqrt(distSq) || 0.001;
      const t = dist / radius;
      const falloff = evaluateFalloff(t, f.falloff as FalloffCurve);
      const mag = f.strength * falloff * sensitivity;

      fx += (dx / dist) * mag;
      fy += (dy / dist) * mag;
      intensity = Math.max(intensity, falloff * (f.strength / 400));
    }

    return { fx, fy, intensity };
  }
}
