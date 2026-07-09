import type { PluginManifest, PluginModule } from "@/features/ascii-engine/plugins/types";

/**
 * Example charset pack — blocks / braille / extra density.
 * Loaded via PluginHost without rebuilding core (P9).
 */
export const charsetPackManifest: PluginManifest = {
  id: "example.charset-pack",
  version: "1.0.0",
  name: "Charset Pack (example)",
  description: "Extra density ramps: shade blocks, braille dense, geometric, dots.",
  contributes: {
    charsets: ["shade-blocks", "braille-dense", "geometric", "dots-extra"],
  },
};

export const charsetPackModule: PluginModule = {
  charsets: [
    {
      id: "shade-blocks",
      label: "Shade blocks",
      glyphs: " ░▒▓█",
    },
    {
      id: "braille-dense",
      label: "Braille dense",
      glyphs: " ⠀⠁⠂⠃⠄⠅⠆⠇⠈⠉⠊⠋⠌⠍⠎⠏⠐⠑⠒⠓⠔⠕⠖⠗⠘⠙⠚⠛⠜⠝⠞⠟⠠⠡⠢⠣⠤⠥⠦⠧⠨⠩⠪⠫⠬⠭⠮⠯⠰⠱⠲⠳⠴⠵⠶⠷⠸⠹⠺⠻⠼⠽⠾⠿",
    },
    {
      id: "geometric",
      label: "Geometric",
      glyphs: " ·▪▫■□▲△●○◆◇",
    },
    {
      id: "dots-extra",
      label: "Dots extra",
      glyphs: " .·:;!|Il1i",
    },
  ],
};

/** Convenience: manifest + module for `host.load(...)`. */
export const charsetPackPlugin = {
  manifest: charsetPackManifest,
  module: charsetPackModule,
} as const;
