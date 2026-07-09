import path from "node:path";
import { decodeGifBuffer } from "@/features/ascii-interaction/animation-pipeline/decoder/gif-decoder";
import { convertRgbaFramesBatch } from "@/features/ascii-interaction/animation-pipeline/converter/frame-converter";
import {
  DEFAULT_IMAGE_PIPELINE_OPTIONS,
  mergePipelineOptions,
  matrixToAsciiSource,
  matrixToJson,
} from "@/features/ascii-interaction/image-pipeline";
import type { AsciiMatrix } from "@/features/ascii-interaction/image-pipeline/types";
import type { AsciiAnimation } from "@/features/ascii-interaction/animation-pipeline/types";
import { ProjectDocument } from "@/features/ascii-engine/document";
import { parseAsciiMatrixFromText } from "@/features/ascii-interaction/animation-pipeline/importer/matrix-parser";
import { extOf, readInputFile, readInputText, writeOutputText } from "@/features/ascii-engine/cli/fs-io";

export interface CliConvertOptions {
  input: string;
  output: string;
  width?: number;
  format?: "txt" | "json" | "auto";
}

const RASTER_BROWSER_ONLY = new Set([".png", ".jpg", ".jpeg", ".webp", ".svg"]);

function resolveFormat(output: string, explicit?: CliConvertOptions["format"]): "txt" | "json" {
  if (explicit && explicit !== "auto") return explicit;
  const ext = path.extname(output).toLowerCase();
  if (ext === ".json") return "json";
  return "txt";
}

function isAsciiMatrix(data: unknown): data is AsciiMatrix {
  return (
    typeof data === "object" &&
    data !== null &&
    "cells" in data &&
    "cols" in data &&
    "rows" in data
  );
}

function isAsciiAnimation(data: unknown): data is AsciiAnimation {
  return (
    typeof data === "object" &&
    data !== null &&
    "frames" in data &&
    Array.isArray((data as AsciiAnimation).frames)
  );
}

function isProjectDocumentData(data: unknown): boolean {
  return (
    typeof data === "object" &&
    data !== null &&
    (data as { version?: string }).version === "3.0" &&
    "layers" in data &&
    "meta" in data
  );
}

function matrixOutput(matrix: AsciiMatrix, format: "txt" | "json"): string {
  return format === "json" ? matrixToJson(matrix) : matrixToAsciiSource(matrix);
}

function animationToTxtSequence(animation: AsciiAnimation): string {
  return animation.frames
    .map((f, i) => {
      const header = `--- frame ${i} delayMs=${f.delayMs} ---`;
      return `${header}\n${f.source ?? matrixToAsciiSource(f.matrix)}`;
    })
    .join("\n\n");
}

async function convertGif(input: string, output: string, width: number, format: "txt" | "json"): Promise<void> {
  const buf = await readInputFile(input);
  const ab = Uint8Array.from(buf).buffer;
  const decoded = await decodeGifBuffer(ab);
  const options = mergePipelineOptions(DEFAULT_IMAGE_PIPELINE_OPTIONS, { width });
  const frames = convertRgbaFramesBatch(decoded.frames, options);
  const frameDelays = frames.map((f) => f.delayMs);
  const animation: AsciiAnimation = {
    width: frames[0]?.matrix.cols ?? 0,
    height: frames[0]?.matrix.rows ?? 0,
    frameCount: frames.length,
    frames,
    fps: 0,
    loop: true,
    frameDelays,
    totalDurationMs: frameDelays.reduce((a, b) => a + b, 0),
    pipelineOptions: options,
    sourceName: path.basename(input),
  };

  if (format === "json") {
    await writeOutputText(output, JSON.stringify(animation, null, 2));
  } else {
    await writeOutputText(output, animationToTxtSequence(animation));
  }
  console.log(
    `convert: GIF ${decoded.frameCount} frames → ${output} (${format}, width=${width})`,
  );
}

async function convertTxt(input: string, output: string, format: "txt" | "json"): Promise<void> {
  const text = await readInputText(input);
  const charset = DEFAULT_IMAGE_PIPELINE_OPTIONS.charset;
  const matrix = parseAsciiMatrixFromText(text, charset);
  await writeOutputText(output, matrixOutput(matrix, format));
  console.log(`convert: TXT matrix ${matrix.cols}×${matrix.rows} → ${output} (${format})`);
}

async function convertJson(input: string, output: string, format: "txt" | "json"): Promise<void> {
  const raw = JSON.parse(await readInputText(input)) as unknown;

  if (isProjectDocumentData(raw)) {
    const doc = ProjectDocument.fromJSON(raw as Parameters<typeof ProjectDocument.fromJSON>[0]);
    const state = doc.editor.getState();
    const active = state.layers.find((l) => l.id === state.activeLayerId);
    const matrix = active?.matrix ?? null;
    if (matrix) {
      await writeOutputText(output, matrixOutput(matrix, format));
      console.log(`convert: project JSON active layer → ${output} (${format})`);
      return;
    }
    const anim = doc.getAnimation();
    if (anim) {
      await writeOutputText(
        output,
        format === "json" ? JSON.stringify(anim, null, 2) : animationToTxtSequence(anim),
      );
      console.log(`convert: project JSON animation → ${output} (${format})`);
      return;
    }
    await writeOutputText(output, JSON.stringify(doc.toJSON(), null, 2));
    console.log(`convert: project JSON re-serialized → ${output}`);
    return;
  }

  if (isAsciiAnimation(raw)) {
    await writeOutputText(
      output,
      format === "json" ? JSON.stringify(raw, null, 2) : animationToTxtSequence(raw),
    );
    console.log(`convert: animation JSON → ${output} (${format})`);
    return;
  }

  if (isAsciiMatrix(raw)) {
    await writeOutputText(output, matrixOutput(raw, format));
    console.log(`convert: matrix JSON → ${output} (${format})`);
    return;
  }

  throw new Error("JSON não reconhecido (esperado ProjectDocument v3, AsciiMatrix ou AsciiAnimation).");
}

/**
 * convert — caminhos Node:
 * - GIF → ASCII (gifuct + RGBA pipeline)
 * - TXT / JSON (matrix, animation, project) → TXT/JSON
 * - PNG/JPEG/WEBP/SVG → erro documentado (browser canvas / sharp futuro)
 */
export async function runConvert(options: CliConvertOptions): Promise<void> {
  const { input, output } = options;
  const width = options.width ?? 80;
  const format = resolveFormat(output, options.format);
  const ext = extOf(input);

  if (RASTER_BROWSER_ONLY.has(ext)) {
    throw new Error(
      [
        `convert: ${ext} não é suportado no CLI Node nesta fase.`,
        "Motivo: sampleImage/ImageAdapter usam canvas DOM.",
        "Suportado agora: .gif (gifuct), .txt, .json (matrix/animation/project).",
        "Alternativas: converter no browser lab, ou adicionar sharp/pngjs numa fase futura.",
      ].join("\n"),
    );
  }

  if (ext === ".gif") {
    await convertGif(input, output, width, format);
    return;
  }
  if (ext === ".txt") {
    await convertTxt(input, output, format);
    return;
  }
  if (ext === ".json") {
    await convertJson(input, output, format);
    return;
  }

  throw new Error(
    `convert: extensão não suportada (${ext || "sem extensão"}). Use .gif, .txt ou .json.`,
  );
}
