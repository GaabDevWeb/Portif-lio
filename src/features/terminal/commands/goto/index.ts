import { sectionFromAlias } from "@/features/sync/section-map";
import type { CommandDefinition } from "@/types/root-os";
import { error, success, stdout } from "../shared";

export const gotoCommand: CommandDefinition = {
  name: "goto",
  aliases: ["scroll"],
  description: "Navigate landing to a section",
  usage: "goto <section>",
  category: "navigation",
  execute(_ctx, argv) {
    if (argv.length === 0) {
      return error("goto: missing section operand");
    }

    const section = sectionFromAlias(argv[0]);
    if (!section) {
      return error(`goto: unknown section '${argv[0]}'`);
    }

    return success(stdout(`[system] navigated → #${section}`), {
      gotoSection: section,
    });
  },
  autocomplete(_ctx, partial) {
    const sections = [
      "hero",
      "about",
      "manifesto",
      "projects",
      "process",
      "knowledge",
      "graph",
      "timeline",
      "contact",
    ];
    return sections.filter((s) => s.startsWith(partial.toLowerCase()));
  },
};

export const aboutCommand: CommandDefinition = {
  name: "about",
  description: "Scroll to hero / about section",
  usage: "about",
  category: "portfolio",
  execute() {
    return success(stdout("[system] navigated → #hero"), {
      gotoSection: "hero",
    });
  },
};

export const terminalCommand: CommandDefinition = {
  name: "terminal",
  description: "Toggle Terminal.app",
  usage: "terminal",
  category: "navigation",
  execute() {
    return success(stdout("[system] toggling Terminal.app"), {
      toggleTerminal: true,
    });
  },
};
