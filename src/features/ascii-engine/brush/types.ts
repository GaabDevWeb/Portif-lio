export type BrushKind =
  | "pencil"
  | "brush"
  | "spray"
  | "airbrush"
  | "noise"
  | "matrix"
  | "fire"
  | "smoke"
  | "rain"
  | "calligraphy"
  | "particle"
  | "pattern"
  | "character"
  | "unicode"
  | "text"
  | "image";

export type BrushStatus = "ready" | "experimental" | "stub";

export type BrushCharsetMode = "fixed" | "density" | "random" | "gradient";

export interface BrushColor {
  r: number;
  g: number;
  b: number;
}

/** Serializable brush preset — stored on StrokeObject / project. */
export interface BrushPreset {
  id: string;
  name: string;
  kind: BrushKind;
  status: BrushStatus;
  charset: string;
  charsetMode: BrushCharsetMode;
  colors: BrushColor[];
  size: number;
  density: number;
  opacitySim: number;
  scatter: number;
  spacing: number;
  rotation: number;
  flow: number;
  hardness: number;
  blendMode: "normal" | "multiply" | "screen" | "overlay";
  randomization: number;
}

export interface StampCell {
  col: number;
  row: number;
  char: string;
  luminance: number;
  r: number;
  g: number;
  b: number;
}

export interface StampOptions {
  /** World cell center of stamp. */
  col: number;
  row: number;
  pressure?: number;
  seed?: number;
}
