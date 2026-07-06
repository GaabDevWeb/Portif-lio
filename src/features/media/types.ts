export type LoopMode = "off" | "one" | "all";

export type Track = {
  id: string;
  title: string;
  url: string;
  ext: "mp3";
  bytes?: number;
};

export type MusicManifest = {
  version: string;
  generatedAt: string;
  tracks: Track[];
};

