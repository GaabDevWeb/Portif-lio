/** Formatos suportados na v1; arquitetura preparada para GIF/AVIF/SVG raster. */
export const SUPPORTED_IMAGE_MIMES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
] as const;

export type SupportedImageMime = (typeof SUPPORTED_IMAGE_MIMES)[number];

export type MappingMode = "brightness" | "density" | "edge" | "hybrid";

export type DitheringMode =
  | "none"
  | "floyd-steinberg"
  | "ordered"
  | "bayer"
  | "bayer-2x2"
  | "bayer-4x4"
  | "atkinson"
  | "jarvis"
  | "burkes"
  | "sierra"
  | "stucki";

export type ColorMode =
  | "mono"
  | "color"
  | "ansi16"
  | "ansi256"
  | "truecolor"
  | "gradient"
  | "root-os";

export interface ImagePipelineOptions {
  width: number;
  height: number;
  lockAspectRatio: boolean;
  pixelAspect: number;
  /**
   * @deprecated Ignored by AspectRatioEngine / resolveOutputSize. Kept for recipe/JSON compat only.
   * Geometry uses glyphCellWidth/Height (default 7×12).
   */
  fontCompensation: number;
  /** Explicit glyph cell width (CSS px). When set with glyphCellHeight, skips measure. */
  glyphCellWidth?: number;
  /** Explicit glyph cell height (CSS px). */
  glyphCellHeight?: number;
  /** −1 … +1 (UI may map −100…+100). */
  brightness: number;
  /** Multiplier; 1 = neutral (UI may map 0%…300% → 0…3). */
  contrast: number;
  gamma: number;
  exposure: number;
  /** 0…1 sharpen amount. */
  sharpness: number;
  /**
   * @deprecated Prefer invertLuminance + invertColors.
   * When true, both luminance and RGB are inverted (legacy).
   */
  invert: boolean;
  /** Invert luminance only (ASCII “negative ink”). */
  invertLuminance: boolean;
  /** Invert RGB channels (full photographic negative). */
  invertColors: boolean;
  threshold: number;
  blur: number;
  edgeEnhance: number;
  /** Levels black point 0…1. */
  blackPoint: number;
  /** Levels midtone 0.01…0.99 (0.5 = linear). */
  midPoint: number;
  /** Levels white point 0…1. */
  whitePoint: number;
  /** 0 = sparse charset subset … 1 = full charset. */
  characterDensity: number;
  /** −1 favour light glyphs … +1 favour solid glyphs. */
  characterBias: number;
  /** Stretch luminance to image histogram before char mapping. */
  adaptiveMapping: boolean;
  charset: string;
  mappingMode: MappingMode;
  dithering: DitheringMode;
  colorMode: ColorMode;
}

export interface AsciiMatrixCell {
  char: string;
  col: number;
  row: number;
  luminance: number;
  r: number;
  g: number;
  b: number;
}

/** Matriz ASCII gerada pelo pipeline — entrada nativa da engine. */
export interface AsciiMatrix {
  cols: number;
  rows: number;
  cells: AsciiMatrixCell[];
  charset: string;
}

export interface ImageSampleBuffer {
  width: number;
  height: number;
  luminance: Float32Array;
  r: Uint8ClampedArray;
  g: Uint8ClampedArray;
  b: Uint8ClampedArray;
}

export interface PipelineBenchmark {
  conversionMs: number;
  characterCount: number;
  cols: number;
  rows: number;
}

export interface PipelineResult {
  matrix: AsciiMatrix;
  source: string;
  previewDataUrl: string | null;
  sourceWidth: number;
  sourceHeight: number;
  benchmark: PipelineBenchmark;
}

export interface ImagePipelinePreset {
  id: string;
  label: string;
  options: Partial<ImagePipelineOptions>;
}

export const DEFAULT_IMAGE_PIPELINE_OPTIONS: ImagePipelineOptions = {
  width: 120,
  height: 0,
  lockAspectRatio: true,
  pixelAspect: 1,
  fontCompensation: 1,
  brightness: 0,
  contrast: 1,
  gamma: 1,
  exposure: 0,
  sharpness: 0,
  invert: false,
  invertLuminance: false,
  invertColors: false,
  threshold: 0,
  blur: 0,
  edgeEnhance: 0,
  blackPoint: 0,
  midPoint: 0.5,
  whitePoint: 1,
  characterDensity: 1,
  characterBias: 0,
  adaptiveMapping: false,
  charset: " .:-=+*#%@",
  mappingMode: "brightness",
  dithering: "floyd-steinberg",
  colorMode: "root-os",
};
