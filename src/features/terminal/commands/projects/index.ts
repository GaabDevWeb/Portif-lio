import { SYSTEM } from "@/constants/system";
import { loadProjects } from "@/lib/content/projects";
import type { CommandDefinition } from "@/types/root-os";
import { success, stdout } from "../shared";

export const projectsCommand: CommandDefinition = {
  name: "projects",
  description: "List portfolio projects and navigate to projects section",
  usage: "projects [filter]",
  category: "portfolio",
  chapter: 5,
  execute(_ctx, argv) {
    const filter = argv[0]?.toLowerCase();
    const projects = loadProjects().filter((p) =>
      filter ? p.title.toLowerCase().includes(filter) || p.slug.includes(filter) : true,
    );

    const lines = projects.flatMap((p) =>
      stdout(`${p.slug.padEnd(16)} ${p.title} (${p.year})`),
    );

    return success(lines, {
      gotoSection: "projects",
      cwd: `${SYSTEM.homeDir}/projects`,
      chapterComplete: 5,
      selectedProject: projects[0]?.slug ?? null,
    });
  },
};
