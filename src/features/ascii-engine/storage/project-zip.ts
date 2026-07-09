import JSZip from "jszip";

import { ProjectDocument } from "@/features/ascii-engine/document/project-document";
import type { ProjectDocumentData } from "@/features/ascii-engine/document/types";
import { downloadBlob } from "@/features/ascii-engine/browser";

export interface ProjectManifest {
  version: 1;
  format: "ascii-project";
  projectVersion: "3.0";
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectAssetBinary {
  /** Path relativo no ZIP, ex.: `assets/abc.png` */
  path: string;
  data: Blob | ArrayBuffer | Uint8Array;
}

const README = `ASCII Engine Project Package
============================
Format: *.ascii-project.zip
Schema: ProjectDocument 3.0

Contents:
- manifest.json   — formato e metadados leves
- document.json   — ProjectDocument serializado
- assets/         — binários referenciados (opcional)
- preview.png     — preview opcional

Importável em /labs/ascii (tab Studio).
`;

/**
 * Empacota ProjectDocument + assets opcionais em `*.ascii-project.zip`.
 * Blob-first — download é responsabilidade do browser adapter.
 */
export async function exportProjectZip(
  doc: ProjectDocument,
  options: { assets?: ProjectAssetBinary[]; previewPng?: Blob } = {},
): Promise<Blob> {
  const data = doc.toJSON();
  const zip = new JSZip();

  const manifest: ProjectManifest = {
    version: 1,
    format: "ascii-project",
    projectVersion: "3.0",
    id: data.id,
    name: data.meta.name,
    createdAt: data.meta.createdAt,
    updatedAt: data.meta.updatedAt,
  };

  zip.file("manifest.json", JSON.stringify(manifest, null, 2));
  zip.file("document.json", JSON.stringify(data, null, 2));
  zip.file("README.txt", README);

  if (options.assets?.length) {
    const folder = zip.folder("assets");
    if (!folder) throw new Error("Falha ao criar pasta assets/");
    for (const asset of options.assets) {
      const relative = asset.path.replace(/^assets\//, "");
      folder.file(relative, asset.data);
    }
  }

  if (options.previewPng) {
    zip.file("preview.png", options.previewPng);
  }

  return zip.generateAsync({ type: "blob", compression: "DEFLATE" });
}

export async function downloadProjectZip(
  doc: ProjectDocument,
  options: { assets?: ProjectAssetBinary[]; previewPng?: Blob; filename?: string } = {},
): Promise<Blob> {
  const blob = await exportProjectZip(doc, options);
  const safe = (doc.getMeta().name || "project").replace(/[^\w.-]+/g, "_");
  downloadBlob(blob, options.filename ?? `${safe}.ascii-project.zip`);
  return blob;
}

export interface ImportProjectZipResult {
  document: ProjectDocument;
  manifest: ProjectManifest;
  /** Assets binários lidos do ZIP (path → bytes). */
  assets: Map<string, Uint8Array>;
}

function isProjectManifest(value: unknown): value is ProjectManifest {
  if (!value || typeof value !== "object") return false;
  const m = value as ProjectManifest;
  return m.format === "ascii-project" && m.version === 1 && m.projectVersion === "3.0";
}

/**
 * Importa `*.ascii-project.zip` → ProjectDocument.
 */
export async function importProjectZip(
  input: Blob | ArrayBuffer | File,
): Promise<ImportProjectZipResult> {
  const zip = await JSZip.loadAsync(input);
  const manifestFile = zip.file("manifest.json");
  const documentFile = zip.file("document.json");
  if (!manifestFile || !documentFile) {
    throw new Error("ZIP inválido: faltam manifest.json ou document.json.");
  }

  const manifest = JSON.parse(await manifestFile.async("string")) as unknown;
  if (!isProjectManifest(manifest)) {
    throw new Error('ZIP inválido: manifest.format deve ser "ascii-project" v1 / project 3.0.');
  }

  const raw = JSON.parse(await documentFile.async("string")) as ProjectDocumentData;
  const document = ProjectDocument.fromJSON(raw);

  const assets = new Map<string, Uint8Array>();
  const assetFolder = zip.folder("assets");
  if (assetFolder) {
    const files: Array<{ path: string; file: JSZip.JSZipObject }> = [];
    assetFolder.forEach((relativePath, file) => {
      if (!file.dir) files.push({ path: `assets/${relativePath}`, file });
    });
    for (const { path, file } of files) {
      assets.set(path, await file.async("uint8array"));
    }
  }

  return { document, manifest, assets };
}
