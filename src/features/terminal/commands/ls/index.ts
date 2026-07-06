import { getVirtualFilesystem } from "@/features/vfs";
import { formatPromptPath } from "@/lib/utils";
import type { CommandDefinition } from "@/types/root-os";
import { error, success } from "../shared";

export const lsCommand: CommandDefinition = {
  name: "ls",
  description: "List directory contents",
  usage: "ls [-la] [path]",
  category: "navigation",
  chapter: 4,
  execute(ctx, argv) {
    const vfs = getVirtualFilesystem();
    const showAll = argv.includes("-a") || argv.includes("-la") || argv.includes("-al");
    const showLong = argv.includes("-l") || argv.includes("-la") || argv.includes("-al");
    const pathArg = argv.find((arg) => !arg.startsWith("-"));
    const targetPath = pathArg
      ? vfs.resolve(pathArg, ctx.cwd)
      : ctx.cwd;

    const entries = vfs.listDirectory(targetPath);
    if (!entries) {
      return error(`ls: cannot access '${pathArg ?? targetPath}': No such file or directory`);
    }

    const visible = showAll
      ? entries
      : entries.filter((entry) => !entry.name.startsWith("."));

    if (visible.length === 0) {
      return success([]);
    }

    const lines = visible.map((entry) => {
      const prefix = entry.type === "directory" ? "d" : "-";
      const name = entry.name;
      if (showLong) {
        const perms = entry.type === "directory" ? "drwxr-xr-x" : "-rw-r--r--";
        return {
          stream: "stdout" as const,
          text: `${prefix}${perms}  1 guest guest  4096 Jan  1 00:00 ${name}`,
        };
      }
      const suffix = entry.type === "directory" ? "/" : "";
      return {
        stream: "stdout" as const,
        text: `${name}${suffix}`,
      };
    });

    if (!showLong) {
      return success([
        {
          stream: "stdout",
          text: lines.map((l) => l.text).join("  "),
        },
      ], { chapterComplete: 4 });
    }

    return success(lines, { chapterComplete: 4 });
  },
  autocomplete(ctx, partial) {
    return completePath(ctx, partial);
  },
};

function completePath(ctx: { cwd: string; homeDir: string }, partial: string): string[] {
  const vfs = getVirtualFilesystem();
  const isAbsolute = partial.startsWith("/");
  const base = isAbsolute ? partial : `${ctx.cwd}/${partial}`;
  const lastSlash = base.lastIndexOf("/");
  const dirPath = lastSlash <= 0 ? "/" : base.slice(0, lastSlash);
  const prefix = lastSlash >= 0 ? base.slice(lastSlash + 1) : base;

  const entries = vfs.listDirectory(vfs.resolve(dirPath, ctx.cwd));
  if (!entries) return [];

  return entries
    .map((e) => e.name)
    .filter((name) => name.startsWith(prefix))
    .map((name) => {
      const full = dirPath === "/" ? `/${name}` : `${dirPath}/${name}`;
      return isAbsolute ? full : formatPromptPath(full, ctx.homeDir);
    });
}
