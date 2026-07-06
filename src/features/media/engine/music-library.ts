import { MUSIC_MANIFEST_URL } from "@/constants/assets";
import type { MusicManifest, Track } from "@/features/media/types";

let cache: { manifest: MusicManifest; fetchedAt: number } | null = null;
let inflight: Promise<MusicManifest> | null = null;

async function fetchManifest(): Promise<MusicManifest> {
  if (cache) return cache.manifest;
  if (inflight) return inflight;

  inflight = fetch(MUSIC_MANIFEST_URL, { cache: "force-cache" })
    .then(async (res) => {
      if (!res.ok) throw new Error(`music manifest: HTTP ${res.status}`);
      return (await res.json()) as MusicManifest;
    })
    .then((manifest) => {
      cache = { manifest, fetchedAt: Date.now() };
      inflight = null;
      return manifest;
    })
    .catch((err) => {
      inflight = null;
      throw err;
    });

  return inflight;
}

export async function loadMusicManifest(): Promise<MusicManifest> {
  return await fetchManifest();
}

export async function loadTracks(): Promise<Track[]> {
  const manifest = await loadMusicManifest();
  return manifest.tracks ?? [];
}

export function clearMusicManifestCache(): void {
  cache = null;
  inflight = null;
}

