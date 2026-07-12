import type { ImagePipelineOptions, ImagePipelinePreset } from "@/features/ascii-interaction/image-pipeline/types";

/** Smart refinement presets — only adjust sliders, never invent formats. */
export const REFINEMENT_PRESETS: ImagePipelinePreset[] = [
  {
    id: "portrait",
    label: "Portrait",
    options: {
      width: 100,
      contrast: 1.15,
      gamma: 1.1,
      midPoint: 0.45,
      sharpness: 0.25,
      edgeEnhance: 0.2,
      dithering: "floyd-steinberg",
      characterDensity: 0.9,
      adaptiveMapping: true,
      colorMode: "truecolor",
    },
  },
  {
    id: "anime",
    label: "Anime",
    options: {
      width: 110,
      contrast: 1.35,
      gamma: 0.95,
      blackPoint: 0.05,
      whitePoint: 0.95,
      edgeEnhance: 0.35,
      dithering: "atkinson",
      charset: " .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$",
      colorMode: "truecolor",
    },
  },
  {
    id: "manga",
    label: "Manga",
    options: {
      width: 120,
      contrast: 1.6,
      gamma: 1.05,
      invertLuminance: false,
      dithering: "bayer-4x4",
      edgeEnhance: 0.45,
      colorMode: "mono",
      charset: " .:-=+*#%@",
    },
  },
  {
    id: "pixel-art",
    label: "Pixel Art",
    options: {
      width: 64,
      contrast: 1.4,
      dithering: "none",
      sharpness: 0.4,
      characterDensity: 0.7,
      colorMode: "ansi16",
      charset: " ░▒▓█",
    },
  },
  {
    id: "photograph",
    label: "Photograph",
    options: {
      width: 140,
      contrast: 1.1,
      gamma: 1.15,
      adaptiveMapping: true,
      dithering: "jarvis",
      characterDensity: 1,
      colorMode: "truecolor",
    },
  },
  {
    id: "landscape",
    label: "Landscape",
    options: {
      width: 160,
      contrast: 1.2,
      gamma: 1.2,
      midPoint: 0.48,
      dithering: "sierra",
      colorMode: "truecolor",
    },
  },
  {
    id: "architecture",
    label: "Architecture",
    options: {
      width: 130,
      contrast: 1.45,
      edgeEnhance: 0.5,
      sharpness: 0.35,
      dithering: "floyd-steinberg",
      colorMode: "mono",
    },
  },
  {
    id: "ui-screenshot",
    label: "UI Screenshot",
    options: {
      width: 150,
      contrast: 1.25,
      dithering: "none",
      sharpness: 0.3,
      threshold: 0,
      colorMode: "truecolor",
      charset: " .:-=+*#%@",
    },
  },
  {
    id: "terminal",
    label: "Terminal",
    options: {
      width: 100,
      colorMode: "root-os",
      dithering: "ordered",
      charset: " .:-=+*#%@",
      contrast: 1.3,
    },
  },
  {
    id: "blueprint",
    label: "Blueprint",
    options: {
      width: 120,
      invertLuminance: true,
      colorMode: "gradient",
      contrast: 1.4,
      edgeEnhance: 0.4,
      dithering: "atkinson",
    },
  },
  {
    id: "matrix",
    label: "Matrix",
    options: {
      width: 100,
      colorMode: "root-os",
      invertLuminance: false,
      dithering: "bayer-2x2",
      charset: "01",
      characterDensity: 1,
      contrast: 1.5,
    },
  },
  {
    id: "crt",
    label: "CRT",
    options: {
      width: 90,
      colorMode: "root-os",
      gamma: 1.3,
      contrast: 1.25,
      dithering: "floyd-steinberg",
      blur: 0.15,
    },
  },
  {
    id: "high-contrast",
    label: "High Contrast",
    options: {
      contrast: 2.2,
      blackPoint: 0.1,
      whitePoint: 0.9,
      dithering: "none",
      characterDensity: 0.55,
    },
  },
  {
    id: "low-light",
    label: "Low Light",
    options: {
      brightness: 0.25,
      gamma: 1.5,
      midPoint: 0.38,
      blackPoint: 0,
      whitePoint: 0.85,
      adaptiveMapping: true,
      dithering: "sierra",
    },
  },
  {
    id: "sketch",
    label: "Sketch",
    options: {
      mappingMode: "edge",
      edgeEnhance: 0.8,
      contrast: 1.5,
      dithering: "atkinson",
      colorMode: "mono",
      charset: " .-+*#",
    },
  },
];

export function getRefinementPreset(id: string): ImagePipelinePreset | undefined {
  return REFINEMENT_PRESETS.find((p) => p.id === id);
}

export function exportPipelineSettingsJson(options: ImagePipelineOptions): string {
  return JSON.stringify(
    {
      version: 1,
      format: "ascii-engine-pipeline",
      options,
    },
    null,
    2,
  );
}

export function parsePipelineSettingsJson(raw: string): Partial<ImagePipelineOptions> {
  const data = JSON.parse(raw) as { options?: Partial<ImagePipelineOptions> } & Partial<ImagePipelineOptions>;
  if (data && typeof data === "object" && data.options && typeof data.options === "object") {
    return data.options;
  }
  return data as Partial<ImagePipelineOptions>;
}
