import { SYSTEM } from "@/constants/system";
import type { CommandDefinition } from "@/types/root-os";
import { ascii } from "@/features/ascii";
import { loadProjects } from "@/lib/content/projects";
import { success, stdout } from "../shared";

export const neofetchCommand: CommandDefinition = {
  name: "neofetch",
  description: "Display system information (ROOT OS)",
  usage: "neofetch",
  category: "system",
  execute(ctx) {
    const projects = loadProjects();
    const featured = projects.filter((p) => p.featured).length;

    const logo = ascii.presetBanner("ROOT_OS");
    const info = ascii.table({
      headers: ["Key", "Value"],
      rows: [
        ["System", `${SYSTEM.name} ${SYSTEM.version}`],
        ["Kernel", "rootos.personal"],
        ["Framework", "Next.js App Router"],
        ["Runtime", "Browser (xterm + WM)"],
        ["User", `${ctx.user}${ctx.isRoot ? " (root)" : ""}`],
        ["Projects", `${projects.length} (${featured} featured)`],
      ],
    });

    const block = ascii.box(
      [
        ...logo,
        "",
        ...info,
      ],
      { title: "NEOFETCH", style: "double" },
    );

    return success(block.flatMap((l) => stdout(l)));
  },
};

