import type { FalloffCurve } from "@/features/ascii-interaction/types";

/** Atenuação radial normalizada (t em [0,1]). */
export function evaluateFalloff(t: number, curve: FalloffCurve): number {
  const clamped = t <= 0 ? 1 : t >= 1 ? 0 : 1 - t;

  switch (curve) {
    case "gaussian":
      return Math.exp(-t * t * 4.5);
    case "inverse":
      return 1 / (1 + t * t * 6);
    case "smoothstep":
    default:
      return clamped * clamped * (3 - 2 * clamped);
  }
}

/** Distância euclidiana ao quadrado (evita sqrt quando possível). */
export function distSq(ax: number, ay: number, bx: number, by: number): number {
  const dx = ax - bx;
  const dy = ay - by;
  return dx * dx + dy * dy;
}

/** Clamp numérico inclusivo. */
export function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}

/** Gera id único para campos emitidos. */
let fieldIdCounter = 0;

export function nextFieldId(): string {
  fieldIdCounter += 1;
  return `field-${fieldIdCounter}`;
}

/** Índice de densidade base do caractere ASCII (0 = vazio, 1 = denso). */
const CHAR_DENSITY: Record<string, number> = {
  " ": 0,
  ".": 0.08,
  ":": 0.14,
  ";": 0.18,
  "'": 0.12,
  "-": 0.22,
  "=": 0.35,
  "+": 0.42,
  "*": 0.5,
  "#": 0.72,
  "%": 0.68,
  "@": 0.85,
  "█": 1,
  "░": 0.25,
  "▒": 0.45,
  "▓": 0.7,
};

export function charBaseDensity(char: string): number {
  return CHAR_DENSITY[char] ?? 0.4;
}

/** Atribui layer (0 = distante) a partir da densidade do glifo base. */
export function charToLayer(char: string, layerCount: number): number {
  const d = charBaseDensity(char);
  const layer = Math.floor(d * layerCount);
  return clamp(layer, 0, layerCount - 1);
}
