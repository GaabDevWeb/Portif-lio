import type { CommandDefinition } from "@/types/root-os";
import { ascii } from "@/features/ascii";
import { success, stdout } from "../shared";

const STARTER_ROWS: Array<[string, string]> = [
  ["whoami", "Open profile + identity"],
  ["projects", "List featured work"],
  ["open projects", "Open Projects.app"],
  ["goto projects", "Jump landing to Projects"],
  ["terminal", "Toggle Terminal.app"],
  ["neofetch", "System info"],
  ["ascii ROOT OS", "ASCII banner"],
  ["help <cmd>", "Command manual"],
];

const POWER_ROWS: Array<[string, string]> = [
  ["top", "System monitor"],
  ["git log", "Timeline feed"],
  ["tree -L 3 /", "Logical tree"],
  ["man <cmd>", "Man pages"],
  ["history", "Command history"],
  ["shutdown -h now", "Power off (story ending)"],
];

export const cheatsheetCommand: CommandDefinition = {
  name: "cheatsheet",
  aliases: ["tutorial"],
  description: "Guided command starter kit",
  usage: "cheatsheet",
  category: "navigation",
  execute() {
    const intro = ascii.box(
      [
        `${ascii.icon("success")} ROOT OS quickstart`,
        "",
        "This is not a brochure. It's a system.",
        "Start with the starter kit, then power commands.",
      ],
      { title: "TUTORIAL", style: "double" },
    );

    const starter = ascii.box(
      ascii.table({ headers: ["Command", "What it does"], rows: STARTER_ROWS }).join("\n"),
      { title: "Starter kit", style: "single" },
    );

    const power = ascii.box(
      ascii.table({ headers: ["Command", "What it does"], rows: POWER_ROWS }).join("\n"),
      { title: "Power commands", style: "single" },
    );

    const lines = [...intro, "", ...starter, "", ...power].flatMap((l) => stdout(l));
    return success(lines, { chapterComplete: 2 });
  },
};

