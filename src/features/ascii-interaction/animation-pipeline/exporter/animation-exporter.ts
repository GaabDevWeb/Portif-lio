import JSZip from "jszip";

import type {
  AnimationManifest,
  AnimationMetadata,
  AsciiAnimation,
} from "@/features/ascii-interaction/animation-pipeline/types";
import { matrixToAsciiSource } from "@/features/ascii-interaction/image-pipeline/exporter";
import { renderMatrixToPng } from "@/features/ascii-interaction/image-pipeline/exporter";
import { padFrameIndex } from "@/features/ascii-interaction/animation-pipeline/utilities/timing";
import { downloadBlob } from "@/features/ascii-interaction/animation-pipeline/utilities/zip";

const README = `ASCII Animation Package (ROOT OS)
================================
Format: animation.ascii.zip
Version: 1

Contents:
- manifest.json   — schema e opções de conversão
- metadata.json   — origem e tempos
- palette.txt     — charset utilizado
- frames/         — um .txt por frame
- preview.png     — preview estático
- thumbnail.png   — miniatura

Importável em /labs/ascii (modo Animation).
`;

export async function exportAsciiAnimationZip(animation: AsciiAnimation): Promise<Blob> {
  const zip = new JSZip();
  const first = animation.frames[0]?.matrix;
  const cols = first?.cols ?? 0;
  const rows = first?.rows ?? 0;

  const manifest: AnimationManifest = {
    version: 1,
    format: "ascii-animation",
    frameCount: animation.frameCount,
    cols,
    rows,
    fps: animation.fps,
    loop: animation.loop,
    charset: animation.pipelineOptions.charset,
    colorMode: animation.pipelineOptions.colorMode,
    pipelineOptions: animation.pipelineOptions,
  };

  const metadata: AnimationMetadata = {
    sourceName: animation.sourceName,
    sourceType: "image/gif",
    convertedAt: new Date().toISOString(),
    totalDurationMs: animation.totalDurationMs,
    frameDelays: animation.frameDelays,
    gifWidth: animation.width,
    gifHeight: animation.height,
  };

  zip.file("manifest.json", JSON.stringify(manifest, null, 2));
  zip.file("metadata.json", JSON.stringify(metadata, null, 2));
  zip.file("palette.txt", `${animation.pipelineOptions.charset}\n${animation.pipelineOptions.colorMode}`);
  zip.file("README.txt", README);

  const framesFolder = zip.folder("frames");
  if (!framesFolder) throw new Error("Falha ao criar pasta frames/");

  for (const frame of animation.frames) {
    framesFolder.file(`${padFrameIndex(frame.index)}.txt`, matrixToAsciiSource(frame.matrix));
  }

  if (first) {
    const preview = await renderMatrixToPng(first, {});
    zip.file("preview.png", preview);
    const thumb = await renderMatrixToPng(first, { maxWidth: 160 });
    zip.file("thumbnail.png", thumb);
  }

  return zip.generateAsync({ type: "blob", compression: "DEFLATE" });
}

export async function downloadAsciiAnimationZip(
  animation: AsciiAnimation,
  filename = "animation.ascii.zip",
): Promise<void> {
  const blob = await exportAsciiAnimationZip(animation);
  downloadBlob(blob, filename);
}
