import { loadSkills } from "@/lib/content/skills";
import type { CommandDefinition } from "@/types/root-os";
import { success, stdout } from "../shared";

export const skillsCommand: CommandDefinition = {
  name: "skills",
  description: "Show technical skills and open Monitor.app",
  usage: "skills [--json]",
  category: "portfolio",
  chapter: 8,
  opensApp: "monitor",
  execute(_ctx, argv) {
    const skills = loadSkills();
    const asJson = argv.includes("--json");

    if (asJson) {
      const payload = Object.fromEntries(
        skills.map((s) => [s.name, { level: s.level, process: s.process }]),
      );
      return success(stdout(JSON.stringify(payload, null, 2)), {
        openApp: "monitor",
        chapterComplete: 8,
      });
    }

    const lines = skills.flatMap((s) =>
      stdout(`${s.name.padEnd(14)} ${"█".repeat(Math.round(s.level / 10))} ${s.level}%`),
    );

    return success(lines, {
      openApp: "monitor",
      chapterComplete: 8,
    });
  },
};
