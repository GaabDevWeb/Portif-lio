import type { ImagePipelinePreset } from "@/features/ascii-interaction/image-pipeline/types";

export const IMAGE_PIPELINE_PRESETS: ImagePipelinePreset[] = [
  {
    id: "portrait",
    label: "Portrait",
    options: { width: 100, mappingMode: "brightness", dithering: "floyd-steinberg", colorMode: "crt-green" },
  },
  {
    id: "poster",
    label: "Poster",
    options: { width: 160, contrast: 1.2, gamma: 0.9, charset: " ░▒▓█", dithering: "atkinson" },
  },
  {
    id: "edge-art",
    label: "Edge Art",
    options: { mappingMode: "edge", edgeEnhance: 1, dithering: "none", charset: " .:-=+*#%@" },
  },
  {
    id: "retro",
    label: "Retro CRT",
    options: { width: 80, contrast: 1.3, gamma: 1.2, colorMode: "crt-green", blur: 0.3 },
  },
  {
    id: "matrix",
    label: "Matrix",
    options: { charset: " 01", colorMode: "gradient", dithering: "ordered", invert: false },
  },
  {
    id: "high-detail",
    label: "High Detail",
    options: {
      width: 200,
      charset: " .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$",
      dithering: "sierra",
      sharpness: 0.4,
    },
  },
];

export function getImagePipelinePreset(id: string): ImagePipelinePreset | undefined {
  return IMAGE_PIPELINE_PRESETS.find((p) => p.id === id);
}
