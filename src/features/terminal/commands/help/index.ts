import type { CommandDefinition } from "@/types/root-os";
import { getCommandRegistry } from "../../registry/command-registry";
import { success, stdout } from "../shared";

const CATEGORIES = [
  { key: "navigation", label: "Navigation" },
  { key: "system", label: "System" },
  { key: "portfolio", label: "Portfolio" },
  { key: "easter", label: "Easter Eggs" },
] as const;

export const helpCommand: CommandDefinition = {
  name: "help",
  aliases: ["?"],
  description: "Display help information",
  usage: "help [command]",
  category: "navigation",
  chapter: 2,
  execute(ctx, argv) {
    const target = argv[0];

    if (target) {
      const cmd = getCommandRegistry().resolve(target);
      if (!cmd) {
        return {
          exitCode: 1,
          lines: [{ stream: "stderr", text: `help: no command '${target}'` }],
        };
      }
      return success([
        ...stdout(`${cmd.name} — ${cmd.description}`),
        ...stdout(`Usage: ${cmd.usage}`),
        ...(cmd.aliases?.length
          ? stdout(`Aliases: ${cmd.aliases.join(", ")}`)
          : []),
      ]);
    }

    const registry = getCommandRegistry();
    const lines = stdout("ROOT OS — available commands:\n");

    for (const category of CATEGORIES) {
      const commands = registry
        .list()
        .filter((cmd) => cmd.category === category.key && !cmd.name.startsWith("_"));
      if (commands.length === 0) continue;
      lines.push({
        stream: "stdout",
        text: `\n${category.label}:`,
      });
      for (const cmd of commands) {
        lines.push({
          stream: "stdout",
          text: `  ${cmd.name.padEnd(14)} ${cmd.description}`,
        });
      }
    }

    lines.push({
      stream: "stdout",
      text: "\nTip: type 'whoami' to begin.",
    });

    return success(lines, { chapterComplete: 2 });
  },
  autocomplete(ctx, partial) {
    return getCommandRegistry()
      .list()
      .map((cmd) => cmd.name)
      .filter((name) => name.startsWith(partial));
  },
};
