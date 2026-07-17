import JSZip from "jszip";

import type {
  AnimationManifest,
  AnimationMetadata,
  AsciiAnimation,
  AsciiAnimationFrame,
} from "@/features/ascii-interaction/animation-pipeline/types";
import { parseAsciiMatrixFromText } from "@/features/ascii-interaction/animation-pipeline/importer/matrix-parser";

export async function importAsciiAnimationZip(file: Blob): Promise<AsciiAnimation> {
  const zip = await JSZip.loadAsync(file);
  const manifestRaw = await zip.file("manifest.json")?.async("string");
  const metadataRaw = await zip.file("metadata.json")?.async("string");

  if (!manifestRaw || !metadataRaw) {
    throw new Error("manifest.json ou metadata.json ausente no .ascii.zip");
  }

  const manifest = JSON.parse(manifestRaw) as AnimationManifest;
  const metadata = JSON.parse(metadataRaw) as AnimationMetadata;

  if (manifest.version !== 1 || manifest.format !== "ascii-animation") {
    throw new Error("Versão ou formato não suportado.");
  }

  const frames: AsciiAnimationFrame[] = [];
  const framesFolder = zip.folder("frames");
  if (!framesFolder) throw new Error("Pasta frames/ ausente.");

  for (let i = 0; i < manifest.frameCount; i += 1) {
    const name = `${String(i).padStart(4, "0")}.txt`;
    const text = await zip.file(`frames/${name}`)?.async("string");
    if (!text) continue;
    const matrix = parseAsciiMatrixFromText(text, manifest.pipelineOptions.charset);
    frames.push({
      index: i,
      matrix,
      delayMs: metadata.frameDelays[i] ?? 1000 / manifest.fps,
      source: text,
    });
  }

  if (frames.length === 0) {
    throw new Error("Nenhum frame encontrado no arquivo.");
  }

  return {
    width: metadata.gifWidth,
    height: metadata.gifHeight,
    frameCount: frames.length,
    frames,
    fps: manifest.fps,
    loop: manifest.loop,
    frameDelays: metadata.frameDelays.slice(0, frames.length),
    totalDurationMs: metadata.totalDurationMs,
    pipelineOptions: manifest.pipelineOptions,
    sourceName: metadata.sourceName,
  };
}
