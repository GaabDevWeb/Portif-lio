const STORAGE_KEY = "ascii-engine:gallery:favorites";

function readRaw(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === "string");
  } catch {
    return [];
  }
}

function writeRaw(ids: string[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    /* quota / private mode */
  }
}

/** Lê favoritos persistidos no browser. */
export function loadFavoriteIds(): Set<string> {
  return new Set(readRaw());
}

export function saveFavoriteIds(ids: ReadonlySet<string>): void {
  writeRaw([...ids]);
}

export function toggleFavoriteId(id: string, current: ReadonlySet<string>): Set<string> {
  const next = new Set(current);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  saveFavoriteIds(next);
  return next;
}

export function isFavoriteId(id: string, favorites: ReadonlySet<string>): boolean {
  return favorites.has(id);
}
