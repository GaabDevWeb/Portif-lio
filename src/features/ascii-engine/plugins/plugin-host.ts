import type { CharsetRegistry } from "@/features/ascii-engine/plugins/charset-registry";
import { defaultCharsetRegistry } from "@/features/ascii-engine/plugins/charset-registry";
import type { ThemeRegistry } from "@/features/ascii-engine/plugins/theme-registry";
import { defaultThemeRegistry } from "@/features/ascii-engine/plugins/theme-registry";
import type {
  LoadedPlugin,
  PluginContext,
  PluginManifest,
  PluginModule,
} from "@/features/ascii-engine/plugins/types";

export interface PluginHostOptions {
  charsets?: CharsetRegistry;
  themes?: ThemeRegistry;
}

/**
 * Host de plugins — fase 1 same-origin only (sem iframe/worker).
 * `load(manifest, module)` regista contribuições sem alterar o Core.
 */
export class PluginHost {
  readonly charsets: CharsetRegistry;
  readonly themes: ThemeRegistry;
  private readonly loaded = new Map<string, LoadedPlugin>();

  constructor(options: PluginHostOptions = {}) {
    this.charsets = options.charsets ?? defaultCharsetRegistry;
    this.themes = options.themes ?? defaultThemeRegistry;
  }

  list(): LoadedPlugin[] {
    return [...this.loaded.values()];
  }

  get(id: string): LoadedPlugin | undefined {
    return this.loaded.get(id);
  }

  isLoaded(id: string): boolean {
    return this.loaded.has(id);
  }

  /**
   * Carrega um módulo local (import estático ou dinâmico same-origin).
   * Idempotente por `manifest.id`: reload substitui contribuições anteriores do mesmo id.
   */
  async load(manifest: PluginManifest, module: PluginModule): Promise<LoadedPlugin> {
    this.assertManifest(manifest);

    if (this.loaded.has(manifest.id)) {
      await this.unload(manifest.id);
    }

    const ctx = this.createContext(manifest);

    for (const c of module.charsets ?? []) {
      ctx.registerCharset(c);
    }
    for (const t of module.themes ?? []) {
      ctx.registerTheme(t);
    }

    if (module.activate) {
      await module.activate(ctx);
    }

    const entry: LoadedPlugin = {
      manifest,
      module,
      loadedAt: Date.now(),
    };
    this.loaded.set(manifest.id, entry);
    return entry;
  }

  async unload(id: string): Promise<boolean> {
    const entry = this.loaded.get(id);
    if (!entry) return false;

    const ctx = this.createContext(entry.manifest);
    if (entry.module.deactivate) {
      await entry.module.deactivate(ctx);
    }
    this.loaded.delete(id);
    return true;
  }

  private createContext(manifest: PluginManifest): PluginContext {
    const pluginId = manifest.id;
    return {
      manifest,
      registerCharset: (contribution) => {
        this.charsets.register(contribution, pluginId);
      },
      registerTheme: (contribution) => {
        this.themes.register(contribution, pluginId);
      },
    };
  }

  private assertManifest(manifest: PluginManifest): void {
    if (!manifest?.id || typeof manifest.id !== "string") {
      throw new Error("PluginManifest.id is required");
    }
    if (!manifest.version || typeof manifest.version !== "string") {
      throw new Error("PluginManifest.version is required");
    }
    if (!manifest.contributes || typeof manifest.contributes !== "object") {
      throw new Error("PluginManifest.contributes is required");
    }
  }
}

export const defaultPluginHost = new PluginHost();
