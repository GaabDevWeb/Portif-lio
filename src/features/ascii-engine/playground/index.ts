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

const STUB_IDS: PlaygroundEffectId[] = ["tornado", "cloth"];

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

function canvasSize(surface: InfluencerSurface): { w: number; h: number } {
  const canvas = surface.getCanvasElement();
  return {
    w: canvas?.clientWidth ?? 800,
    h: canvas?.clientHeight ?? 600,
  };
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
      const { w, h } = canvasSize(surface);
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
      const { w, h } = canvasSize(surface);
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
      const { w, h } = canvasSize(surface);
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
      const { w, h } = canvasSize(surface);
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

/** Chamas ascendentes a partir da base — rajadas quentes e curtas. */
class FireEffect implements PlaygroundEffect {
  readonly id = "fire" as const;
  readonly descriptor: PlaygroundEffectDescriptor = {
    id: "fire",
    label: "ASCII Fire",
    status: "ready",
    description: "Rajadas ascendentes a partir da base da superfície.",
  };

  mount(surface: InfluencerSurface): { stop: () => void } {
    let alive = true;
    let timer = 0;
    const tick = () => {
      if (!alive) return;
      const { w, h } = canvasSize(surface);
      const bursts = 2 + Math.floor(Math.random() * 2);
      for (let i = 0; i < bursts; i++) {
        emitPulse(surface, {
          x: w * 0.15 + Math.random() * w * 0.7,
          y: h * 0.75 + Math.random() * h * 0.2,
          radius: 35 + Math.random() * 55,
          strength: 140 + Math.random() * 100,
          falloff: "smoothstep",
          duration: 280 + Math.random() * 180,
          velocity: {
            x: (Math.random() - 0.5) * 50,
            y: -(180 + Math.random() * 120),
          },
        });
      }
      timer = window.setTimeout(tick, 90);
    };
    timer = window.setTimeout(tick, 80);
    return {
      stop: () => {
        alive = false;
        window.clearTimeout(timer);
      },
    };
  }
}

/** Vento lateral contínuo com rajadas. */
class WindEffect implements PlaygroundEffect {
  readonly id = "wind" as const;
  readonly descriptor: PlaygroundEffectDescriptor = {
    id: "wind",
    label: "ASCII Wind",
    status: "ready",
    description: "Fluxo horizontal com rajadas laterais.",
  };

  mount(surface: InfluencerSurface): { stop: () => void } {
    let alive = true;
    let timer = 0;
    let phase = 0;
    const tick = () => {
      if (!alive) return;
      const { w, h } = canvasSize(surface);
      phase += 0.35;
      const gust = 0.6 + 0.4 * Math.sin(phase);
      emitPulse(surface, {
        x: w * 0.1 + Math.random() * w * 0.2,
        y: h * 0.2 + Math.random() * h * 0.6,
        radius: 70 + Math.random() * 90,
        strength: (90 + Math.random() * 70) * gust,
        falloff: "gaussian",
        duration: 450,
        velocity: { x: 160 + Math.random() * 80 * gust, y: (Math.random() - 0.5) * 30 },
      });
      timer = window.setTimeout(tick, 110);
    };
    timer = window.setTimeout(tick, 80);
    return {
      stop: () => {
        alive = false;
        window.clearTimeout(timer);
      },
    };
  }
}

/** Campo de partículas — muitos impulsos curtos espalhados. */
class ParticleFieldEffect implements PlaygroundEffect {
  readonly id = "particle-field" as const;
  readonly descriptor: PlaygroundEffectDescriptor = {
    id: "particle-field",
    label: "ASCII Particles",
    status: "ready",
    description: "Nuvem de impulsos curtos com velocidades aleatórias.",
  };

  mount(surface: InfluencerSurface): { stop: () => void } {
    let alive = true;
    let timer = 0;
    const tick = () => {
      if (!alive) return;
      const { w, h } = canvasSize(surface);
      const count = 4 + Math.floor(Math.random() * 4);
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 40 + Math.random() * 140;
        emitPulse(surface, {
          x: Math.random() * w,
          y: Math.random() * h,
          radius: 18 + Math.random() * 28,
          strength: 60 + Math.random() * 90,
          falloff: "smoothstep",
          duration: 220 + Math.random() * 200,
          velocity: { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed },
        });
      }
      timer = window.setTimeout(tick, 100);
    };
    timer = window.setTimeout(tick, 60);
    return {
      stop: () => {
        alive = false;
        window.clearTimeout(timer);
      },
    };
  }
}

/** Explosões periódicas no centro com onda expansiva. */
class ExplosionEffect implements PlaygroundEffect {
  readonly id = "explosion" as const;
  readonly descriptor: PlaygroundEffectDescriptor = {
    id: "explosion",
    label: "ASCII Explosion",
    status: "ready",
    description: "Explosões periódicas com onda expansiva radial.",
  };

  mount(surface: InfluencerSurface): { stop: () => void } {
    let alive = true;
    let timer = 0;
    let ring = 0;
    const boom = () => {
      if (!alive) return;
      const { w, h } = canvasSize(surface);
      const cx = w * (0.35 + Math.random() * 0.3);
      const cy = h * (0.35 + Math.random() * 0.3);
      ring = 0;
      const expand = () => {
        if (!alive) return;
        ring += 1;
        const t = ring / 8;
        emitPulse(surface, {
          x: cx,
          y: cy,
          radius: 40 + ring * 28,
          strength: 280 * (1 - t * 0.85),
          falloff: "inverse",
          duration: 180,
        });
        if (ring < 8) {
          timer = window.setTimeout(expand, 70);
        } else {
          timer = window.setTimeout(boom, 900);
        }
      };
      expand();
    };
    timer = window.setTimeout(boom, 120);
    return {
      stop: () => {
        alive = false;
        window.clearTimeout(timer);
      },
    };
  }
}

/** Água — ondulação horizontal com deriva suave. */
class WaterEffect implements PlaygroundEffect {
  readonly id = "water" as const;
  readonly descriptor: PlaygroundEffectDescriptor = {
    id: "water",
    label: "ASCII Water",
    status: "ready",
    description: "Ondulação horizontal com deriva suave tipo superfície líquida.",
  };

  mount(surface: InfluencerSurface): { stop: () => void } {
    let alive = true;
    let timer = 0;
    let phase = 0;
    const tick = () => {
      if (!alive) return;
      const { w, h } = canvasSize(surface);
      phase += 0.4;
      const bands = 3;
      for (let i = 0; i < bands; i++) {
        const t = (i + 1) / (bands + 1);
        emitPulse(surface, {
          x: w * (0.2 + 0.15 * Math.sin(phase + i)),
          y: h * t + Math.sin(phase * 1.3 + i * 1.7) * h * 0.04,
          radius: 90 + Math.sin(phase + i) * 30,
          strength: 70 + Math.sin(phase * 0.7 + i) * 30,
          falloff: "gaussian",
          duration: 520,
          velocity: {
            x: 50 + Math.sin(phase + i) * 40,
            y: Math.cos(phase * 0.9 + i) * 18,
          },
        });
      }
      timer = window.setTimeout(tick, 160);
    };
    timer = window.setTimeout(tick, 80);
    return {
      stop: () => {
        alive = false;
        window.clearTimeout(timer);
      },
    };
  }
}

/** Noise — campo turbulento com posições e forças pseudo-aleatórias. */
class NoiseEffect implements PlaygroundEffect {
  readonly id = "noise" as const;
  readonly descriptor: PlaygroundEffectDescriptor = {
    id: "noise",
    label: "ASCII Noise",
    status: "ready",
    description: "Campo turbulento com impulsos pseudo-aleatórios contínuos.",
  };

  mount(surface: InfluencerSurface): { stop: () => void } {
    let alive = true;
    let timer = 0;
    let seed = Math.random() * 1000;
    const tick = () => {
      if (!alive) return;
      const { w, h } = canvasSize(surface);
      seed += 1.7;
      const n = 3;
      for (let i = 0; i < n; i++) {
        const s = seed + i * 17.3;
        const nx = (Math.sin(s * 0.31) + Math.sin(s * 0.17 + 1.2)) * 0.5;
        const ny = (Math.cos(s * 0.23) + Math.sin(s * 0.41 + 0.7)) * 0.5;
        emitPulse(surface, {
          x: w * (0.5 + nx * 0.45),
          y: h * (0.5 + ny * 0.45),
          radius: 50 + Math.abs(Math.sin(s * 0.5)) * 70,
          strength: 50 + Math.abs(Math.cos(s * 0.37)) * 100,
          falloff: "gaussian",
          duration: 350,
          velocity: {
            x: Math.sin(s * 0.9) * 90,
            y: Math.cos(s * 1.1) * 90,
          },
        });
      }
      timer = window.setTimeout(tick, 130);
    };
    timer = window.setTimeout(tick, 70);
    return {
      stop: () => {
        alive = false;
        window.clearTimeout(timer);
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
    this.register(new FireEffect());
    this.register(new WindEffect());
    this.register(new ParticleFieldEffect());
    this.register(new ExplosionEffect());
    this.register(new WaterEffect());
    this.register(new NoiseEffect());
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
