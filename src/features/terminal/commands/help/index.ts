import type { CommandDefinition } from "@/types/root-os";
import { getCommandRegistry } from "../../registry/command-registry";
import { success, stdout } from "../shared";
import { ascii } from "@/features/ascii";

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
      const meta = ascii.table({
        headers: ["Field", "Value"],
        rows: [
          ["Name", cmd.name],
          ["Description", cmd.description],
          ["Usage", cmd.usage],
          ["Category", cmd.category],
          ["Aliases", cmd.aliases?.length ? cmd.aliases.join(", ") : "—"],
        ],
      });
      return success(meta.flatMap((l) => stdout(l)));
    }

    const registry = getCommandRegistry();
    const header = ascii.box(
      [
        `${ascii.icon("terminal")} ROOT OS — command index`,
        "",
        "Type `help <command>` for details.",
        "Tip: `cheatsheet` for a guided start.",
      ],
      { title: "MAN", style: "double" },
    );
    const lines = header.flatMap((l) => stdout(l));

    for (const category of CATEGORIES) {
      const commands = registry
        .list()
        .filter((cmd) => cmd.category === category.key && !cmd.name.startsWith("_"));
      if (commands.length === 0) continue;
      lines.push(...stdout(""));
      lines.push(...stdout(`${category.label}:`));

      const table = ascii.table({
        headers: ["Command", "Description"],
        rows: commands.map((cmd) => [cmd.name, cmd.description]),
      });
      lines.push(...table.flatMap((l) => stdout(l)));
    }

    lines.push(...stdout(""));
    lines.push(...stdout(`${ascii.icon("success")} Try: whoami · neofetch · ascii ROOT OS · open terminal`));

    return success(lines, { chapterComplete: 2 });
  },
  autocomplete(ctx, partial) {
    return getCommandRegistry()
      .list()
      .map((cmd) => cmd.name)
      .filter((name) => name.startsWith(partial));
  },
};
