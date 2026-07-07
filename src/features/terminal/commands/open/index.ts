import { projectAppId } from "@/lib/app-id";
import { getProjectBySlug, loadProjects } from "@/lib/content/projects";
import type { AppId, CommandDefinition } from "@/types/root-os";
import { error, misuse, success, stdout } from "../shared";

const APP_ALIASES: Record<string, AppId> = {
  terminal: "terminal",
  music: "media",
  player: "media",
  media: "media",
  profile: "profile",
  projects: "projects",
  project: "projects",
  editor: "editor",
  manifesto: "editor",
  timeline: "timeline",
  monitor: "monitor",
  mail: "mail",
  contact: "mail",
  finder: "finder",
  resume: "resume",
  architecture: "architecture",
  arch: "architecture",
  stack: "architecture",
  help: "help",
  man: "help",
};

function resolveOpenTarget(target: string): { appId?: AppId; projectSlug?: string } {
  const lower = target.toLowerCase();
  const appId = APP_ALIASES[lower];
  if (appId) return { appId };

  const project = getProjectBySlug(lower) ?? loadProjects().find(
    (p) => p.title.toLowerCase().replace(/\s+/g, "-") === lower,
  );
  if (project) return { projectSlug: project.slug };

  return {};
}

export const openCommand: CommandDefinition = {
  name: "open",
  description: "Open application or project",
  usage: "open <app|project>",
  category: "navigation",
  execute(ctx, argv) {
    if (argv.length === 0) {
      return misuse("open: missing operand");
    }

    const target = argv[0];
    const resolved = resolveOpenTarget(target);

    if (resolved.appId) {
      return success(stdout(`Opening ${resolved.appId}.app...`), {
        openApp: resolved.appId,
      });
    }

    if (resolved.projectSlug) {
      const project = getProjectBySlug(resolved.projectSlug)!;
      return success(stdout(`Opening case study /projects/${project.slug}...`), {
        openProject: resolved.projectSlug,
        selectedProject: resolved.projectSlug,
      });
    }

    return error(`open: ${target}: No such application`);
  },
  autocomplete(_ctx, partial) {
    const projectSlugs = loadProjects().map((p) => p.slug);
    return [...Object.keys(APP_ALIASES), ...projectSlugs].filter((key) =>
      key.startsWith(partial.toLowerCase()),
    );
  },
};

export const closeCommand: CommandDefinition = {
  name: "close",
  description: "Close application window",
  usage: "close [app]",
  category: "navigation",
  execute(ctx, argv) {
    const target = argv[0]?.toLowerCase();
    let appId: AppId | null = null;

    if (target) {
      const resolved = resolveOpenTarget(target);
      appId = resolved.appId ?? (resolved.projectSlug ? projectAppId(resolved.projectSlug) : null);
    } else {
      appId = ctx.focusedApp;
    }

    if (!appId) {
      return error("close: no application focused");
    }

    if (!ctx.openApps.includes(appId)) {
      return error(`close: ${appId} is not running`);
    }

    return success(stdout("Application terminated."), { closeApp: appId });
  },
};
