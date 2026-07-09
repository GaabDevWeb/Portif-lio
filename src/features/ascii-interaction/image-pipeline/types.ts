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
  fontCompensation: number;
  brightness: number;
  contrast: number;
  gamma: number;
  exposure: number;
  sharpness: number;
  invert: boolean;
  threshold: number;
  blur: number;
  edgeEnhance: number;
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
  fontCompensation: 0.55,
  brightness: 0,
  contrast: 1,
  gamma: 1,
  exposure: 0,
  sharpness: 0,
  invert: false,
  threshold: 0,
  blur: 0,
  edgeEnhance: 0,
  charset: " .:-=+*#%@",
  mappingMode: "brightness",
  dithering: "floyd-steinberg",
  colorMode: "root-os",
};
