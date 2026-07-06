import type { AppId, CommandDefinition } from "@/types/root-os";
import { error, misuse, success, stdout } from "../shared";

const APP_ALIASES: Record<string, AppId> = {
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

export const openCommand: CommandDefinition = {
  name: "open",
  description: "Open application or file",
  usage: "open <app|file>",
  category: "navigation",
  execute(ctx, argv) {
    if (argv.length === 0) {
      return misuse("open: missing operand");
    }

    const target = argv[0].toLowerCase();
    const appId = APP_ALIASES[target];

    if (appId) {
      return success(
        stdout(`Opening ${appId}.app...`),
        { openApp: appId },
      );
    }

    return error(`open: ${target}: No such application`);
  },
  autocomplete(_ctx, partial) {
    return Object.keys(APP_ALIASES).filter((key) => key.startsWith(partial));
  },
};

export const closeCommand: CommandDefinition = {
  name: "close",
  description: "Close application window",
  usage: "close [app]",
  category: "navigation",
  execute(ctx, argv) {
    const target = argv[0]?.toLowerCase();
    const appId = target ? APP_ALIASES[target] : ctx.focusedApp;

    if (!appId) {
      return error("close: no application focused");
    }

    if (!ctx.openApps.includes(appId)) {
      return error(`close: ${appId}.app is not running`);
    }

    return success(stdout(`Closed ${appId}.app`), { closeApp: appId });
  },
};
