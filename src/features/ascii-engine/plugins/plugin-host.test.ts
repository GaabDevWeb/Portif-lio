import { describe, expect, it } from "vitest";
import { CharsetRegistry } from "@/features/ascii-engine/plugins/charset-registry";
import { ThemeRegistry } from "@/features/ascii-engine/plugins/theme-registry";
import { PluginHost } from "@/features/ascii-engine/plugins/plugin-host";
import {
  charsetPackManifest,
  charsetPackModule,
} from "@/features/ascii-engine/plugins/examples/charset-pack";
import { createAsciiEngine } from "@/features/ascii-engine/sdk/create-ascii-engine";

describe("PluginHost", () => {
  it("loads example charset pack into CharsetRegistry without mutating builtins", async () => {
    const charsets = new CharsetRegistry({ classic: " .:-=+*#%@" });
    const themes = new ThemeRegistry([]);
    const host = new PluginHost({ charsets, themes });

    expect(charsets.has("shade-blocks")).toBe(false);

    const loaded = await host.load(charsetPackManifest, charsetPackModule);

    expect(loaded.manifest.id).toBe("example.charset-pack");
    expect(host.isLoaded("example.charset-pack")).toBe(true);
    expect(host.list()).toHaveLength(1);

    expect(charsets.has("shade-blocks")).toBe(true);
    expect(charsets.get("braille-dense")?.glyphs.length).toBeGreaterThan(10);
    expect(charsets.get("geometric")?.source).toBe("example.charset-pack");
    expect(charsets.get("classic")?.source).toBe("builtin");
    expect(charsets.list().filter((e) => e.source === "example.charset-pack")).toHaveLength(4);
  });

  it("registers themes when module contributes them", async () => {
    const charsets = new CharsetRegistry({});
    const themes = new ThemeRegistry([]);
    const host = new PluginHost({ charsets, themes });

    await host.load(
      {
        id: "example.theme-stub",
        version: "0.1.0",
        contributes: { themes: ["phosphor-soft"] },
      },
      {
        themes: [
          {
            id: "phosphor-soft",
            label: "Phosphor Soft",
            tokens: {
              "--ae-bg": "#0a120a",
              "--ae-panel": "#101a10",
              "--ae-border": "#2a3d2a",
              "--ae-text": "#b8e0b8",
              "--ae-text-dim": "#6a8a6a",
              "--ae-accent": "#7dff9a",
              "--ae-accent-dim": "#3d6b4a",
              "--ae-warn": "#c8ff7d",
            },
          },
        ],
      },
    );

    expect(themes.get("phosphor-soft")?.label).toBe("Phosphor Soft");
    expect(themes.get("phosphor-soft")?.source).toBe("example.theme-stub");
  });

  it("rejects invalid manifest", async () => {
    const host = new PluginHost({
      charsets: new CharsetRegistry({}),
      themes: new ThemeRegistry([]),
    });
    await expect(
      host.load({ id: "", version: "1", contributes: {} }, {}),
    ).rejects.toThrow(/PluginManifest.id/);
  });

  it("createAsciiEngine exposes PluginHost instance", async () => {
    const isolated = new PluginHost({
      charsets: new CharsetRegistry({ classic: " .#" }),
      themes: new ThemeRegistry([]),
    });
    const engine = createAsciiEngine({ plugins: isolated });
    expect(engine.plugins).toBeInstanceOf(PluginHost);
    expect(engine.plugins).toBe(isolated);

    await engine.plugins.load(charsetPackManifest, charsetPackModule);
    expect(engine.plugins.charsets.has("dots-extra")).toBe(true);
  });
});
