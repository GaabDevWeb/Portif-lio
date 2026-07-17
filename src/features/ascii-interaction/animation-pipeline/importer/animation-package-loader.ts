import type {
  AnimationManifest,
  AnimationMetadata,
  AsciiAnimationFrame,
} from "@/features/ascii-interaction/animation-pipeline/types";
import { parseAsciiMatrixFromText } from "@/features/ascii-interaction/animation-pipeline/importer/matrix-parser";
import { padFrameIndex } from "@/features/ascii-interaction/animation-pipeline/utilities/timing";

export interface AsciiAnimationPackageMeta {
  manifest: AnimationManifest;
  metadata: AnimationMetadata;
  basePath: string;
}

export async function loadAsciiAnimationPackageMeta(
  basePath: string,
): Promise<AsciiAnimationPackageMeta> {
  const normalized = basePath.replace(/\/$/, "");
  const [manifestRes, metadataRes] = await Promise.all([
    fetch(`${normalized}/manifest.json`),
    fetch(`${normalized}/metadata.json`),
  ]);

  if (!manifestRes.ok || !metadataRes.ok) {
    throw new Error(`Falha ao carregar animação ASCII em ${normalized}`);
  }

  const manifest = (await manifestRes.json()) as AnimationManifest;
  const metadata = (await metadataRes.json()) as AnimationMetadata;

  if (manifest.version !== 1 || manifest.format !== "ascii-animation") {
    throw new Error("Formato de animação ASCII não suportado.");
  }

  return { manifest, metadata, basePath: normalized };
}

export async function loadAsciiAnimationFrame(
  meta: AsciiAnimationPackageMeta,
  frameIndex: number,
): Promise<AsciiAnimationFrame> {
  const url = `${meta.basePath}/frames/${padFrameIndex(frameIndex)}.txt`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Frame ${frameIndex} indisponível.`);
  const text = await res.text();
  const matrix = parseAsciiMatrixFromText(text, meta.manifest.pipelineOptions.charset);
  return {
    index: frameIndex,
    matrix,
    delayMs: meta.metadata.frameDelays[frameIndex] ?? 1000 / meta.manifest.fps,
    source: text,
  };
}
