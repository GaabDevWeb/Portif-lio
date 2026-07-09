import type { AsciiAnimation, AsciiAnimationFrame } from "@/features/ascii-interaction/animation-pipeline/types";

const DB_NAME = "ascii-animation-storage";
const STORE = "animations";

export async function persistAnimation(id: string, animation: AsciiAnimation): Promise<void> {
  if (typeof indexedDB === "undefined") return;
  await new Promise<void>((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE);
    };
    req.onsuccess = () => {
      const tx = req.result.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(animation, id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function loadPersistedAnimation(id: string): Promise<AsciiAnimation | null> {
  if (typeof indexedDB === "undefined") return null;
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE);
    };
    req.onsuccess = () => {
      const tx = req.result.transaction(STORE, "readonly");
      const get = tx.objectStore(STORE).get(id);
      get.onsuccess = () => resolve((get.result as AsciiAnimation) ?? null);
      get.onerror = () => reject(get.error);
    };
    req.onerror = () => reject(req.error);
  });
}

export function serializeAnimationFrames(frames: AsciiAnimationFrame[]): string {
  return JSON.stringify(frames.map((f) => ({ index: f.index, delayMs: f.delayMs, matrix: f.matrix })));
}
