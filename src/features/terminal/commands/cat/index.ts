import { getVirtualFilesystem } from "@/features/vfs";
import type { CommandDefinition } from "@/types/root-os";
import { error, misuse, success } from "../shared";

export const catCommand: CommandDefinition = {
  name: "cat",
  description: "Concatenate and print files",
  usage: "cat <file...>",
  category: "navigation",
  chapter: 6,
  execute(ctx, argv) {
    if (argv.length === 0) {
      return misuse("cat: missing file operand");
    }

    const vfs = getVirtualFilesystem();
    const lines = [];

    for (const arg of argv) {
      const resolved = vfs.resolve(arg, ctx.cwd);
      const content = vfs.readFile(resolved);
      if (content === null) {
        return error(`cat: ${arg}: No such file or directory`);
      }
      lines.push({ stream: "stdout" as const, text: content });
    }

    const isManifesto = argv.some((a) => a.includes("manifesto"));
    const manifestoPath = isManifesto
      ? `${ctx.homeDir}/manifesto.md`
      : argv[0]
        ? vfs.resolve(argv[0], ctx.cwd)
        : null;

    return success(lines, {
      chapterComplete: isManifesto ? 6 : undefined,
      openApp: isManifesto ? "editor" : undefined,
      editorFile: isManifesto ? manifestoPath : undefined,
    });
  },
};
