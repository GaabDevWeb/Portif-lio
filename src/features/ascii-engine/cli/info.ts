import { createAsciiEngine } from "@/features/ascii-engine/sdk/create-ascii-engine";
import { ASCII_ENGINE_CLI_COMMANDS } from "@/features/ascii-engine/cli/commands";
import { DEFAULT_BENCHMARK_CASES } from "@/features/ascii-engine/benchmark";

/** Imprime versão, catálogos e estado dos comandos CLI. */
export function runInfo(): void {
  const engine = createAsciiEngine();
  const lines: string[] = [];

  lines.push("ascii-engine CLI");
  lines.push(`version: ${engine.version}`);
  lines.push(`runtime: Node ${process.version}`);
  lines.push("");

  lines.push("Commands:");
  for (const cmd of ASCII_ENGINE_CLI_COMMANDS) {
    lines.push(`  ${cmd.name.padEnd(12)} [${cmd.status}]  ${cmd.synopsis}`);
  }
  lines.push("");

  lines.push("Converters:");
  for (const c of engine.converters.list()) {
    lines.push(`  ${c.kind.padEnd(12)} [${c.status}]  ${c.label}`);
  }
  lines.push("");

  lines.push("Exporters:");
  for (const e of engine.exporters) {
    lines.push(`  ${e.id.padEnd(14)} [${e.status}]  ${e.label} (${e.target})`);
  }
  lines.push("");

  lines.push("Importers:");
  for (const i of engine.importers) {
    lines.push(`  ${i.id.padEnd(14)} [${i.status}]  ${i.label}`);
  }
  lines.push("");

  const plugins = engine.plugins.list();
  lines.push(`Plugins loaded: ${plugins.length}`);
  if (plugins.length === 0) {
    lines.push("  (none — load via PluginHost in app; CLI does not auto-load packs)");
  } else {
    for (const p of plugins) {
      lines.push(`  ${p.manifest.id}@${p.manifest.version}`);
    }
  }

  const charsets = engine.plugins.charsets.list();
  lines.push(`Charsets: ${charsets.length} (${charsets.map((c) => c.id).join(", ")})`);
  lines.push(`Themes: ${engine.plugins.themes.list().length}`);
  lines.push(`Playground effects: ${engine.playground.list().length}`);
  lines.push(`Benchmark cases (default): ${DEFAULT_BENCHMARK_CASES.length}`);
  lines.push("");
  lines.push("Node notes:");
  lines.push("  convert: GIF (gifuct) + TXT/JSON project/matrix — PNG/JPEG need browser canvas or sharp");
  lines.push("  benchmark: synthetic RGBA suite (no HTMLImageElement)");

  console.log(lines.join("\n"));
}
