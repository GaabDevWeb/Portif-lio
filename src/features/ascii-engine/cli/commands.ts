/**
 * CLI stubs — estrutura preparada para binário futuro.
 * Comandos planeados (não executáveis nesta branch):
 *
 *   ascii-engine convert <input> -o <output>
 *   ascii-engine export <project> --format gif|zip|txt
 *   ascii-engine play <animation.ascii.zip>
 *   ascii-engine benchmark <image> [--cases ...]
 *   ascii-engine info
 */

export interface CliCommandStub {
  name: string;
  synopsis: string;
  status: "stub";
  description: string;
}

export const ASCII_ENGINE_CLI_COMMANDS: CliCommandStub[] = [
  {
    name: "convert",
    synopsis: "ascii-engine convert <input> -o <output> [--width 120]",
    status: "stub",
    description: "Converte imagem/GIF para ASCII (TXT/JSON/ZIP).",
  },
  {
    name: "export",
    synopsis: "ascii-engine export <project> --format gif|zip|txt|png",
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
    synopsis: "ascii-engine benchmark <image> [--width 80]",
    status: "stub",
    description: "Compara algoritmos/charsets e imprime tabela.",
  },
  {
    name: "info",
    synopsis: "ascii-engine info",
    status: "stub",
    description: "Mostra versão, converters e exporters disponíveis.",
  },
];
