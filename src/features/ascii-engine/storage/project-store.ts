import type { ProjectDocumentData } from "@/features/ascii-engine/document/types";
import { ProjectDocument } from "@/features/ascii-engine/document/project-document";

const DB_NAME = "ascii-engine-projects";
const DB_VERSION = 1;
const STORE = "projects";

export interface ProjectStoreRecord {
  id: string;
  name: string;
  updatedAt: string;
  document: ProjectDocumentData;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB indisponível neste ambiente."));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: "id" });
        store.createIndex("updatedAt", "updatedAt", { unique: false });
        store.createIndex("name", "name", { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("Falha ao abrir IndexedDB."));
  });
}

function toRecord(doc: ProjectDocument): ProjectStoreRecord {
  const data = doc.toJSON();
  return {
    id: data.id,
    name: data.meta.name,
    updatedAt: data.meta.updatedAt,
    document: data,
  };
}

/** Persistência IndexedDB de ProjectDocument (PLATFORM §3.12). */
export class ProjectStore {
  async put(doc: ProjectDocument): Promise<void> {
    doc.touch();
    const record = toRecord(doc);
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(record);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  }

  async get(id: string): Promise<ProjectDocument | null> {
    const db = await openDb();
    const record = await new Promise<ProjectStoreRecord | undefined>((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(id);
      req.onsuccess = () => resolve(req.result as ProjectStoreRecord | undefined);
      req.onerror = () => reject(req.error);
    });
    db.close();
    if (!record) return null;
    return ProjectDocument.fromJSON(record.document);
  }

  async list(): Promise<Array<{ id: string; name: string; updatedAt: string }>> {
    const db = await openDb();
    const rows = await new Promise<ProjectStoreRecord[]>((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).getAll();
      req.onsuccess = () => resolve((req.result as ProjectStoreRecord[]) ?? []);
      req.onerror = () => reject(req.error);
    });
    db.close();
    return rows
      .map((r) => ({ id: r.id, name: r.name, updatedAt: r.updatedAt }))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async delete(id: string): Promise<void> {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  }
}

export const defaultProjectStore = new ProjectStore();
