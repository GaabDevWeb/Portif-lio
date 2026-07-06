import { formatTopOutput, loadSkills } from "@/lib/content/skills";
import type { CommandDefinition } from "@/types/root-os";
import { success } from "../shared";

export const topCommand: CommandDefinition = {
  name: "top",
  description: "Display skills as running processes",
  usage: "top [-b]",
  category: "portfolio",
  chapter: 8,
  opensApp: "monitor",
  execute() {
    const skills = loadSkills();
    const lines = formatTopOutput(skills).map((text) => ({
      stream: "stdout" as const,
      text,
    }));
    lines.push({ stream: "stdout", text: "" });
    lines.push({
      stream: "stdout",
      text: "Press 'q' to quit — or just keep exploring.",
    });
    return success(lines, {
      openApp: "monitor",
      chapterComplete: 8,
    });
  },
};
