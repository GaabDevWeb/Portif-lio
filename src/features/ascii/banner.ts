import { SimpleLru } from "@/features/ascii/cache";

export type BannerPreset =
  | "ROOT_OS"
  | "Gaab"
  | "KernelBot"
  | "Hermes"
  | "Portfolio";

type BannerFont = Record<string, string[]>;

const FONT_3X5: BannerFont = {
  "A": ["██ ", "█ █", "███", "█ █", "█ █"],
  "B": ["██ ", "█ █", "██ ", "█ █", "██ "],
  "E": ["███", "█  ", "██ ", "█  ", "███"],
  "F": ["███", "█  ", "██ ", "█  ", "█  "],
  "G": [" ██", "█  ", "█ █", "█ █", " ██"],
  "H": ["█ █", "█ █", "███", "█ █", "█ █"],
  "I": ["███", " █ ", " █ ", " █ ", "███"],
  "K": ["█ █", "█ █", "██ ", "█ █", "█ █"],
  "L": ["█  ", "█  ", "█  ", "█  ", "███"],
  "M": ["█ █", "███", "███", "█ █", "█ █"],
  "N": ["█ █", "███", "███", "███", "█ █"],
  "O": ["███", "█ █", "█ █", "█ █", "███"],
  "P": ["███", "█ █", "███", "█  ", "█  "],
  "R": ["███", "█ █", "██ ", "█ █", "█ █"],
  "S": [" ██", "█  ", " ██", "  █", "██ "],
  "T": ["███", " █ ", " █ ", " █ ", " █ "],
  "U": ["█ █", "█ █", "█ █", "█ █", "███"],
  "V": ["█ █", "█ █", "█ █", "█ █", " █ "],
  "Y": ["█ █", "█ █", " ██", "  █", "██ "],
  "_": ["   ", "   ", "   ", "   ", "   "],
  " ": ["   ", "   ", "   ", "   ", "   "],
};

const PRESETS: Record<BannerPreset, string> = {
  ROOT_OS: "ROOT OS",
  Gaab: "GAAB",
  KernelBot: "KERNELBOT",
  Hermes: "HERMES",
  Portfolio: "PORTFOLIO",
};

const cache = new SimpleLru<string, string[]>(64);

function normalize(input: string): string {
  return input
    .trim()
    .replaceAll(/\s+/g, " ")
    .toUpperCase()
    .replaceAll(/[^A-Z ]/g, "_");
}

export function renderBannerText(input: string): string[] {
  const key = normalize(input);
  const cached = cache.get(key);
  if (cached) return cached;

  const rows = ["", "", "", "", ""];
  for (const ch of key) {
    const glyph = FONT_3X5[ch] ?? FONT_3X5["_"];
    for (let i = 0; i < 5; i += 1) {
      rows[i] += (glyph[i] ?? "   ") + " ";
    }
  }

  const out = rows.map((r) => r.replaceAll(/\s+$/g, ""));
  cache.set(key, out);
  return out;
}

export function renderPresetBanner(preset: BannerPreset): string[] {
  return renderBannerText(PRESETS[preset]);
}

