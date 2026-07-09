import type { EmitFieldInput, InfluencerSurface } from "@/features/ascii-interaction/types";

export type PlaygroundEffectId =
  | "smoke"
  | "fire"
  | "matrix"
  | "water"
  | "ripple"
  | "wind"
  | "explosion"
  | "tornado"
  | "cloth"
  | "gravity"
  | "noise"
  | "particle-field";

export interface PlaygroundEffectDescriptor {
  id: PlaygroundEffectId;
  label: string;
  status: "ready" | "stub";
  description: string;
}

export interface PlaygroundEffect {
  readonly id: PlaygroundEffectId;
  readonly descriptor: PlaygroundEffectDescriptor;
  mount(surface: InfluencerSurface): { stop: () => void };
}

const STUB_IDS: PlaygroundEffectId[] = [
  "fire",
  "water",
  "wind",
  "explosion",
  "tornado",
  "cloth",
  "noise",
  "particle-field",
];

function stubDescriptor(id: PlaygroundEffectId, label: string): PlaygroundEffectDescriptor {
  return {
    id,
    label,
    status: "stub",
    description: `Efeito ${label} — API pronta, implementação futura.`,
  };
}

class StubEffect implements PlaygroundEffect {
  readonly id: PlaygroundEffectId;
  readonly descriptor: PlaygroundEffectDescriptor;

  constructor(id: PlaygroundEffectId, label: string) {
    this.id = id;
    this.descriptor = stubDescriptor(id, label);
  }

  mount(): { stop: () => void } {
    return { stop: () => undefined };
  }
}

function emitPulse(surface: InfluencerSurface, input: EmitFieldInput): string {
  return surface.emitField(input);
}

class MatrixRainEffect implements PlaygroundEffect {
  readonly id = "matrix" as const;
  readonly descriptor: PlaygroundEffectDescriptor = {
    id: "matrix",
    label: "ASCII Matrix",
    status: "ready",
    description: "Colunas de impulsos verticais tipo chuva Matrix.",
  };

  mount(surface: InfluencerSurface): { stop: () => void } {
    let alive = true;
    let timer = 0;
    const tick = () => {
      if (!alive) return;
      const canvas = surface.getCanvasElement();
      const w = canvas?.clientWidth ?? 800;
      const h = canvas?.clientHeight ?? 600;
      emitPulse(surface, {
        x: Math.random() * w,
        y: Math.random() * h * 0.3,
        radius: 40 + Math.random() * 60,
        strength: 80 + Math.random() * 120,
        falloff: "smoothstep",
        duration: 400,
        velocity: { x: 0, y: 120 },
      });
      timer = window.setTimeout(tick, 120);
    };
    timer = window.setTimeout(tick, 100);
    return {
      stop: () => {
        alive = false;
        window.clearTimeout(timer);
      },
    };
  }
}

class RippleEffect implements PlaygroundEffect {
  readonly id = "ripple" as const;
  readonly descriptor: PlaygroundEffectDescriptor = {
    id: "ripple",
    label: "ASCII Ripple",
    status: "ready",
    description: "Ondas concêntricas a partir do centro.",
  };

  mount(surface: InfluencerSurface): { stop: () => void } {
    let alive = true;
    let phase = 0;
    let timer = 0;
    const tick = () => {
      if (!alive) return;
      const canvas = surface.getCanvasElement();
      const w = canvas?.clientWidth ?? 800;
      const h = canvas?.clientHeight ?? 600;
      phase += 1;
      emitPulse(surface, {
        x: w * 0.5,
        y: h * 0.5,
        radius: 30 + (phase % 20) * 12,
        strength: 160,
        falloff: "gaussian",
        duration: 500,
      });
      timer = window.setTimeout(tick, 200);
    };
    timer = window.setTimeout(tick, 100);
    return {
      stop: () => {
        alive = false;
        window.clearTimeout(timer);
      },
    };
  }
}

class SmokeEffect implements PlaygroundEffect {
  readonly id = "smoke" as const;
  readonly descriptor: PlaygroundEffectDescriptor = {
    id: "smoke",
    label: "ASCII Smoke",
    status: "ready",
    description: "Nuvens suaves com drift ascendente.",
  };

  mount(surface: InfluencerSurface): { stop: () => void } {
    let alive = true;
    let timer = 0;
    const tick = () => {
      if (!alive) return;
      const canvas = surface.getCanvasElement();
      const w = canvas?.clientWidth ?? 800;
      const h = canvas?.clientHeight ?? 600;
      emitPulse(surface, {
        x: w * 0.3 + Math.random() * w * 0.4,
        y: h * 0.6 + Math.random() * h * 0.2,
        radius: 80 + Math.random() * 100,
        strength: 40 + Math.random() * 40,
        falloff: "gaussian",
        duration: 900,
        velocity: { x: (Math.random() - 0.5) * 40, y: -60 },
      });
      timer = window.setTimeout(tick, 180);
    };
    timer = window.setTimeout(tick, 100);
    return {
      stop: () => {
        alive = false;
        window.clearTimeout(timer);
      },
    };
  }
}

class GravityWellEffect implements PlaygroundEffect {
  readonly id = "gravity" as const;
  readonly descriptor: PlaygroundEffectDescriptor = {
    id: "gravity",
    label: "ASCII Gravity",
    status: "ready",
    description: "Poço gravitacional no centro da superfície.",
  };

  mount(surface: InfluencerSurface): { stop: () => void } {
    let alive = true;
    let timer = 0;
    let fieldId = "";
    const tick = () => {
      if (!alive) return;
      const canvas = surface.getCanvasElement();
      const w = canvas?.clientWidth ?? 800;
      const h = canvas?.clientHeight ?? 600;
      if (fieldId) surface.removeField(fieldId);
      fieldId = emitPulse(surface, {
        x: w * 0.5,
        y: h * 0.5,
        radius: Math.min(w, h) * 0.35,
        strength: 220,
        falloff: "inverse",
        duration: 400,
      });
      timer = window.setTimeout(tick, 250);
    };
    timer = window.setTimeout(tick, 50);
    return {
      stop: () => {
        alive = false;
        window.clearTimeout(timer);
        if (fieldId) surface.removeField(fieldId);
      },
    };
  }
}

const LABEL: Record<PlaygroundEffectId, string> = {
  smoke: "Smoke",
  fire: "Fire",
  matrix: "Matrix",
  water: "Water",
  ripple: "Ripple",
  wind: "Wind",
  explosion: "Explosion",
  tornado: "Tornado",
  cloth: "Cloth",
  gravity: "Gravity",
  noise: "Noise",
  "particle-field": "Particle Field",
};

export class PlaygroundRegistry {
  private readonly effects = new Map<PlaygroundEffectId, PlaygroundEffect>();

  constructor() {
    this.register(new MatrixRainEffect());
    this.register(new RippleEffect());
    this.register(new SmokeEffect());
    this.register(new GravityWellEffect());
    for (const id of STUB_IDS) {
      this.register(new StubEffect(id, LABEL[id]));
    }
  }

  register(effect: PlaygroundEffect): void {
    this.effects.set(effect.id, effect);
  }

  get(id: PlaygroundEffectId): PlaygroundEffect | undefined {
    return this.effects.get(id);
  }

  list(): PlaygroundEffectDescriptor[] {
    return [...this.effects.values()].map((e) => e.descriptor);
  }
}

export const defaultPlaygroundRegistry = new PlaygroundRegistry();
