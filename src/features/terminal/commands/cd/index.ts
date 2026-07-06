import { getVirtualFilesystem } from "@/features/vfs";
import { SYSTEM } from "@/constants/system";
import type { CommandDefinition } from "@/types/root-os";
import { error, success, stdout } from "../shared";

export const cdCommand: CommandDefinition = {
  name: "cd",
  description: "Change working directory",
  usage: "cd <path>",
  category: "navigation",
  chapter: 5,
  execute(ctx, argv) {
    const vfs = getVirtualFilesystem();
    const target = argv[0] ?? ctx.homeDir;
    const resolved = vfs.resolve(target, ctx.cwd);

    if (!vfs.isDirectory(resolved)) {
      return error(`cd: ${target}: No such file or directory`);
    }

    const isProjects =
      resolved === `${SYSTEM.homeDir}/projects` ||
      resolved.endsWith("/projects");

    return success([], {
      cwd: resolved,
      chapterComplete: isProjects ? 5 : undefined,
      openApp: isProjects ? "projects" : undefined,
    });
  },
  autocomplete(ctx, partial) {
    const vfs = getVirtualFilesystem();
    const resolved = vfs.resolve(partial || ".", ctx.cwd);
    const parent = resolved.substring(0, resolved.lastIndexOf("/")) || "/";
    const entries = vfs.listDirectory(parent);
    if (!entries) return [];
    return entries
      .filter((e) => e.type === "directory")
      .map((e) => e.name)
      .filter((name) => name.startsWith(partial.split("/").pop() ?? ""));
  },
};

export const pwdCommand: CommandDefinition = {
  name: "pwd",
  description: "Print working directory",
  usage: "pwd",
  category: "navigation",
  execute(ctx) {
    return success(stdout(ctx.cwd));
  },
};
