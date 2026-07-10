/**
 * Effect helpers — EffectRef factories + stubs outline/glow (expand bounds).
 * invert / colorize / noise: aplicados por célula no compositor.
 * outline / glow / shadow: expandem bounds (stub visual); post-pass documentado.
 */

import type { EffectKind, EffectRef, SceneBounds } from "@/features/ascii-engine/scene/types";

function newFxId(kind: EffectKind): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `fx-${kind}-${Date.now()}`;
}

export function createEffect(
  kind: EffectKind,
  params: Record<string, number | string | boolean> = {},
  enabled = true,
): EffectRef {
  return { id: newFxId(kind), kind, enabled, params };
}

export const EffectFactories = {
  invert: (enabled = true) => createEffect("invert", {}, enabled),
  colorize: (r: number, g: number, b: number, enabled = true) =>
    createEffect("colorize", { r, g, b }, enabled),
  noise: (amount = 0.1, enabled = true) => createEffect("noise", { amount }, enabled),
  /** Stub: radius em células — compositor expande bounds; sem halo real ainda. */
  outline: (radius = 1, enabled = true) => createEffect("outline", { radius }, enabled),
  /** Stub: radius/intensity — expande bounds; glow visual TBD. */
  glow: (radius = 2, intensity = 0.5, enabled = true) =>
    createEffect("glow", { radius, intensity }, enabled),
  shadow: (offsetX = 1, offsetY = 1, enabled = true) =>
    createEffect("shadow", { offsetX, offsetY }, enabled),
  crt: (enabled = true) => createEffect("crt", {}, enabled),
  scanline: (enabled = true) => createEffect("scanline", { density: 0.5 }, enabled),
  posterize: (levels = 4, enabled = true) => createEffect("posterize", { levels }, enabled),
} as const;

/**
 * Quanto expandir bounds para stubs outline/glow/shadow.
 * Usado por tools/UI antes de compose; compositor também aplica padding no blit.
 */
export function effectBoundsPadding(effects: EffectRef[]): number {
  let pad = 0;
  for (const fx of effects) {
    if (!fx.enabled) continue;
    if (fx.kind === "outline" || fx.kind === "glow") {
      pad = Math.max(pad, Math.ceil(Number(fx.params.radius ?? 1)));
    }
    if (fx.kind === "shadow") {
      const ox = Math.abs(Number(fx.params.offsetX ?? 1));
      const oy = Math.abs(Number(fx.params.offsetY ?? 1));
      pad = Math.max(pad, Math.ceil(Math.max(ox, oy)));
    }
  }
  return pad;
}

export function expandBoundsForEffects(bounds: SceneBounds, effects: EffectRef[]): SceneBounds {
  const pad = effectBoundsPadding(effects);
  if (pad <= 0) return { ...bounds };
  return { w: bounds.w + pad * 2, h: bounds.h + pad * 2 };
}

/** Status por kind — documentação para UI. */
export const EFFECT_STATUS: Record<
  EffectKind,
  { status: "ready" | "stub"; note: string }
> = {
  invert: { status: "ready", note: "Inverte luminance + RGB por célula." },
  colorize: { status: "ready", note: "Substitui RGB; params r/g/b." },
  noise: {
    status: "ready",
    note: "Perturba luminance com hash determinístico (col,row,amount).",
  },
  outline: {
    status: "stub",
    note: "Expande bounds (radius); halo outline ainda não rasterizado.",
  },
  glow: {
    status: "stub",
    note: "Expande bounds (radius); glow visual TBD.",
  },
  shadow: {
    status: "stub",
    note: "Expande bounds via offset; sombra não desenhada.",
  },
  crt: { status: "stub", note: "Reservado — post-pass." },
  scanline: { status: "stub", note: "Reservado — post-pass." },
  posterize: { status: "stub", note: "Reservado — post-pass." },
};
