import {
  IMAGE_CHARSETS,
  mapLuminanceToCharIndex,
  resolveCellColor,
} from "@/features/ascii-interaction/image-pipeline/charset-mapper";
import { applyDithering } from "@/features/ascii-interaction/image-pipeline/dithering";
import { matrixToAsciiSource, matrixToJson } from "@/features/ascii-interaction/image-pipeline/exporter";
import type {
  AsciiMatrix,
  AsciiMatrixCell,
  ColorMode,
  DitheringMode,
  ImageSampleBuffer,
} from "@/features/ascii-interaction/image-pipeline/types";
import type { RgbaFrame } from "@/features/ascii-interaction/animation-pipeline/types";

import {
  applySingleFilter,
  asBoolean,
  asNumber,
  asString,
  requireImageBuffer,
  resizeImageBuffer,
  rgbaFrameToImageBuffer,
} from "@/features/ascii-engine/nodes/buffer-ops";
import type { NodeDefinition, NodeExecuteContext, NodePortValue } from "@/features/ascii-engine/nodes/types";

function outImage(buffer: ImageSampleBuffer): Record<string, NodePortValue> {
  return { image: buffer };
}

function mapCharset(
  buffer: ImageSampleBuffer,
  charset: string,
  colorMode: ColorMode,
  dithering: DitheringMode = "none",
): AsciiMatrix {
  const chars = charset.length > 1 ? charset : " .";
  const levels = chars.length;
  const field = applyDithering(
    new Float32Array(buffer.luminance),
    buffer.width,
    buffer.height,
    dithering,
    levels,
  );
  const cells: AsciiMatrixCell[] = [];
  for (let row = 0; row < buffer.height; row += 1) {
    for (let col = 0; col < buffer.width; col += 1) {
      const i = row * buffer.width + col;
      const lum = field[i]!;
      const idx = mapLuminanceToCharIndex(lum, levels);
      const ch = chars[idx] ?? " ";
      if (ch === " " && lum < 0.05) continue;
      const color = resolveCellColor(buffer.r[i]!, buffer.g[i]!, buffer.b[i]!, lum, colorMode);
      cells.push({
        char: ch,
        col,
        row,
        luminance: lum,
        r: color.r,
        g: color.g,
        b: color.b,
      });
    }
  }
  return { cols: buffer.width, rows: buffer.height, cells, charset: chars };
}

const ImageSourceNode: NodeDefinition = {
  type: "ImageSource",
  label: "Image Source",
  description: "Injeta ImageBuffer ou RgbaFrame[] (via bindings ou params).",
  inputs: [],
  outputs: [
    { id: "image", type: "ImageBuffer" },
    { id: "frames", type: "RgbaFrame[]" },
  ],
  defaultParams: {},
  execute(ctx: NodeExecuteContext): Record<string, NodePortValue> {
    const fromInput = ctx.inputs.image ?? ctx.inputs.frames;
    if (fromInput && typeof fromInput === "object" && "luminance" in fromInput) {
      return { image: fromInput as ImageSampleBuffer };
    }
    if (Array.isArray(fromInput)) {
      const frames = fromInput as RgbaFrame[];
      const first = frames[0];
      if (!first) throw new Error(`Node ${ctx.nodeId}: RgbaFrame[] vazio`);
      return { image: rgbaFrameToImageBuffer(first), frames };
    }
    const buffer = ctx.params.buffer as ImageSampleBuffer | undefined;
    const frames = ctx.params.frames as RgbaFrame[] | undefined;
    if (buffer) {
      return frames?.length ? { image: buffer, frames } : { image: buffer };
    }
    if (frames?.length) {
      return { image: rgbaFrameToImageBuffer(frames[0]!), frames };
    }
    throw new Error(
      `Node ${ctx.nodeId}: ImageSource precisa de binding/params.buffer ou params.frames`,
    );
  },
};

const ResizeNode: NodeDefinition = {
  type: "Resize",
  label: "Resize",
  inputs: [{ id: "image", type: "ImageBuffer" }],
  outputs: [{ id: "image", type: "ImageBuffer" }],
  defaultParams: { width: 64, height: 32 },
  execute(ctx) {
    const image = requireImageBuffer(ctx.inputs.image, ctx.nodeId);
    const width = asNumber(ctx.params, "width", image.width);
    const height = asNumber(ctx.params, "height", image.height);
    return outImage(resizeImageBuffer(image, width, height));
  },
};

function filterNode(
  type: NodeDefinition["type"],
  label: string,
  defaults: Record<string, unknown>,
  buildPatch: (params: Record<string, unknown>) => Parameters<typeof applySingleFilter>[1],
): NodeDefinition {
  return {
    type,
    label,
    inputs: [{ id: "image", type: "ImageBuffer" }],
    outputs: [{ id: "image", type: "ImageBuffer" }],
    defaultParams: defaults,
    execute(ctx) {
      const image = requireImageBuffer(ctx.inputs.image, ctx.nodeId);
      return outImage(applySingleFilter(image, buildPatch(ctx.params)));
    },
  };
}

const BrightnessNode = filterNode("Brightness", "Brightness", { amount: 0.2 }, (p) => ({
  brightness: asNumber(p, "amount", 0.2),
}));

const ContrastNode = filterNode("Contrast", "Contrast", { amount: 1.2 }, (p) => ({
  contrast: asNumber(p, "amount", 1.2),
}));

const GammaNode = filterNode("Gamma", "Gamma", { amount: 1.2 }, (p) => ({
  gamma: asNumber(p, "amount", 1.2),
}));

const ExposureNode = filterNode("Exposure", "Exposure", { amount: 0.5 }, (p) => ({
  exposure: asNumber(p, "amount", 0.5),
}));

const BlurNode = filterNode("Blur", "Blur", { amount: 0.5 }, (p) => ({
  blur: asNumber(p, "amount", 0.5),
}));

const SharpenNode = filterNode("Sharpen", "Sharpen", { amount: 0.5 }, (p) => ({
  sharpness: asNumber(p, "amount", 0.5),
}));

const EdgeNode = filterNode("Edge", "Edge", { amount: 0.8 }, (p) => ({
  edgeEnhance: asNumber(p, "amount", 0.8),
}));

const ThresholdNode = filterNode("Threshold", "Threshold", { amount: 0.5 }, (p) => ({
  threshold: asNumber(p, "amount", 0.5),
}));

const InvertNode = filterNode("Invert", "Invert", { enabled: true }, (p) => ({
  invert: asBoolean(p, "enabled", true),
}));

const DitherNode: NodeDefinition = {
  type: "Dither",
  label: "Dither",
  inputs: [{ id: "image", type: "ImageBuffer" }],
  outputs: [{ id: "image", type: "ImageBuffer" }],
  defaultParams: { mode: "floyd-steinberg", levels: 8 },
  execute(ctx) {
    const image = requireImageBuffer(ctx.inputs.image, ctx.nodeId);
    const mode = asString(ctx.params, "mode", "floyd-steinberg") as DitheringMode;
    const levels = Math.max(2, Math.round(asNumber(ctx.params, "levels", 8)));
    const luminance = applyDithering(
      new Float32Array(image.luminance),
      image.width,
      image.height,
      mode,
      levels,
    );
    return outImage({
      width: image.width,
      height: image.height,
      luminance,
      r: new Uint8ClampedArray(image.r),
      g: new Uint8ClampedArray(image.g),
      b: new Uint8ClampedArray(image.b),
    });
  },
};

const CharsetMapNode: NodeDefinition = {
  type: "CharsetMap",
  label: "Charset Map",
  description: "ImageBuffer → AsciiMatrix via charset-mapper + dither opcional.",
  inputs: [{ id: "image", type: "ImageBuffer" }],
  outputs: [{ id: "matrix", type: "AsciiMatrix" }],
  defaultParams: {
    charset: IMAGE_CHARSETS.classic,
    colorMode: "mono",
    dithering: "none",
  },
  execute(ctx) {
    const image = requireImageBuffer(ctx.inputs.image, ctx.nodeId);
    const charsetKey = asString(ctx.params, "charsetId", "");
    const charset =
      (charsetKey && IMAGE_CHARSETS[charsetKey]) ||
      asString(ctx.params, "charset", IMAGE_CHARSETS.classic!);
    const colorMode = asString(ctx.params, "colorMode", "mono") as ColorMode;
    const dithering = asString(ctx.params, "dithering", "none") as DitheringMode;
    return { matrix: mapCharset(image, charset, colorMode, dithering) };
  },
};

const ColorModeNode: NodeDefinition = {
  type: "ColorMode",
  label: "Color Mode",
  description: "Reaplica colorMode sobre AsciiMatrix existente (ou ImageBuffer→matrix).",
  inputs: [
    { id: "matrix", type: "AsciiMatrix" },
    { id: "image", type: "ImageBuffer" },
  ],
  outputs: [{ id: "matrix", type: "AsciiMatrix" }],
  defaultParams: { colorMode: "root-os", charset: IMAGE_CHARSETS.classic },
  execute(ctx) {
    const colorMode = asString(ctx.params, "colorMode", "root-os") as ColorMode;
    const existing = ctx.inputs.matrix as AsciiMatrix | undefined;
    if (existing && typeof existing === "object" && "cells" in existing) {
      const cells = existing.cells.map((c) => {
        const color = resolveCellColor(c.r, c.g, c.b, c.luminance, colorMode);
        return { ...c, r: color.r, g: color.g, b: color.b };
      });
      return { matrix: { ...existing, cells } };
    }
    const image = requireImageBuffer(ctx.inputs.image, ctx.nodeId, "image|matrix");
    const charset = asString(ctx.params, "charset", IMAGE_CHARSETS.classic!);
    return { matrix: mapCharset(image, charset, colorMode, "none") };
  },
};

const EffectNode: NodeDefinition = {
  type: "Effect",
  label: "Effect",
  description: "Pass-through tipado; efeitos playground ligam-se na UI (P7).",
  inputs: [
    { id: "image", type: "ImageBuffer" },
    { id: "matrix", type: "AsciiMatrix" },
  ],
  outputs: [
    { id: "image", type: "ImageBuffer" },
    { id: "matrix", type: "AsciiMatrix" },
  ],
  defaultParams: { effectId: "passthrough" },
  execute(ctx) {
    const out: Record<string, NodePortValue> = {};
    if (ctx.inputs.image) out.image = ctx.inputs.image;
    if (ctx.inputs.matrix) out.matrix = ctx.inputs.matrix;
    if (!out.image && !out.matrix) {
      throw new Error(`Node ${ctx.nodeId}: Effect precisa de image ou matrix`);
    }
    return out;
  },
};

const ExportNode: NodeDefinition = {
  type: "Export",
  label: "Export",
  description: "AsciiMatrix → Blob (txt|json). Sem download — Blob-first.",
  inputs: [{ id: "matrix", type: "AsciiMatrix" }],
  outputs: [
    { id: "blob", type: "Blob" },
    { id: "matrix", type: "AsciiMatrix" },
  ],
  defaultParams: { format: "txt" },
  execute(ctx) {
    const matrix = ctx.inputs.matrix as AsciiMatrix | undefined;
    if (!matrix || typeof matrix !== "object" || !("cells" in matrix)) {
      throw new Error(`Node ${ctx.nodeId}: Export espera AsciiMatrix em "matrix"`);
    }
    const format = asString(ctx.params, "format", "txt");
    let content: string;
    let mime: string;
    if (format === "json") {
      content = matrixToJson(matrix);
      mime = "application/json";
    } else {
      content = matrixToAsciiSource(matrix);
      mime = "text/plain;charset=utf-8";
    }
    return {
      blob: new Blob([content], { type: mime }),
      matrix,
    };
  },
};

export const BUILTIN_NODE_DEFINITIONS: NodeDefinition[] = [
  ImageSourceNode,
  ResizeNode,
  BrightnessNode,
  ContrastNode,
  GammaNode,
  ExposureNode,
  BlurNode,
  SharpenNode,
  EdgeNode,
  ThresholdNode,
  InvertNode,
  DitherNode,
  CharsetMapNode,
  ColorModeNode,
  EffectNode,
  ExportNode,
];

export const BUILTIN_NODE_MAP: ReadonlyMap<string, NodeDefinition> = new Map(
  BUILTIN_NODE_DEFINITIONS.map((d) => [d.type, d]),
);

export function getBuiltinNode(type: string): NodeDefinition | undefined {
  return BUILTIN_NODE_MAP.get(type);
}
