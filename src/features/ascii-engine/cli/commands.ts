/**
 * CLI commands — P10: convert | info | benchmark executáveis em Node.
 * export | play | analyze | serve permanecem stubs até fases futuras.
 *
 *   npm run ascii-engine -- info
 *   npm run ascii-engine -- benchmark [--width 80]
 *   npm run ascii-engine -- convert <input> -o <output> [--width 80]
 */

export type CliCommandStatus = "ready" | "stub";

export interface CliCommandStub {
  name: string;
  synopsis: string;
  status: CliCommandStatus;
  description: string;
}

export const ASCII_ENGINE_CLI_COMMANDS: CliCommandStub[] = [
  {
    name: "convert",
    synopsis: "ascii-engine convert <input> -o <output> [--width 80]",
    status: "ready",
    description: "Converte GIF/TXT/JSON (matrix|animation|project) → TXT/JSON. PNG/JPEG: browser-only.",
  },
  {
    name: "export",
    synopsis: "ascii-engine export <project> --format gif|zip|txt",
    status: "stub",
    description: "Exporta projeto/animação no formato pedido.",
  },
  {
    name: "play",
    synopsis: "ascii-engine play <animation.ascii.zip>",
    status: "stub",
    description: "Playback headless ou terminal de pacote .ascii.zip.",
  },
  {
    name: "benchmark",
    synopsis: "ascii-engine benchmark [--width 80]",
    status: "ready",
    description: "Suite RGBA sintética (Node) — tabela ms/cols/rows.",
  },
  {
    name: "analyze",
    synopsis: "ascii-engine analyze <input>",
    status: "stub",
    description: "Stats/histogram (futuro).",
  },
  {
    name: "info",
    synopsis: "ascii-engine info",
    status: "ready",
    description: "Mostra versão, converters, exporters e plugins.",
  },
  {
    name: "serve",
    synopsis: "ascii-engine serve",
    status: "stub",
    description: "HTTP mínimo preview (futuro).",
  },
];
