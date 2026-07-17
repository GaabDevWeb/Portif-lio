import JSZip from "jszip";

import type { AsciiAnimation } from "@/features/ascii-interaction/animation-pipeline/types";
import { padFrameIndex } from "@/features/ascii-interaction/animation-pipeline/utilities/timing";
import { downloadBlob } from "@/features/ascii-interaction/animation-pipeline/utilities/zip";
import { matrixToAsciiSource } from "@/features/ascii-interaction/image-pipeline/exporter";

/** Exporta sequência de frames .txt numerados num ZIP. */
export async function exportAsciiAnimationTxtSequence(animation: AsciiAnimation): Promise<Blob> {
  const zip = new JSZip();
  const folder = zip.folder("frames");
  if (!folder) throw new Error("Falha ao criar pasta frames/.");

  for (const frame of animation.frames) {
    folder.file(`${padFrameIndex(frame.index)}.txt`, matrixToAsciiSource(frame.matrix));
  }

  zip.file(
    "README.txt",
    `ASCII Frame Sequence
====================
Frames: ${animation.frameCount}
Source: ${animation.sourceName}
FPS: ${animation.fps}
Loop: ${animation.loop ? "yes" : "no"}
`,
  );

  return zip.generateAsync({ type: "blob", compression: "DEFLATE" });
}

export async function downloadAsciiAnimationTxtSequence(
  animation: AsciiAnimation,
  filename = "ascii-frames.zip",
): Promise<void> {
  const blob = await exportAsciiAnimationTxtSequence(animation);
  downloadBlob(blob, filename);
}
