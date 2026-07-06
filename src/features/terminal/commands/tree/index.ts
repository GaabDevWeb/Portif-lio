import { getVirtualFilesystem } from "@/features/vfs";
import type { CommandDefinition, VfsNode } from "@/types/root-os";
import { ascii } from "@/features/ascii";
import type { AsciiTreeNode } from "@/features/ascii";
import { error, resolvePathArg, success, stdout } from "../shared";

function vfsToAscii(node: VfsNode, maxDepth: number, depth: number = 0): AsciiTreeNode {
  if (node.type === "file" || depth >= maxDepth) {
    return { type: "file", name: node.name };
  }
  const children = Object.values(node.children)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((child) => vfsToAscii(child, maxDepth, depth + 1));
  return { type: "dir", name: `${node.name}/`, children };
}

export const treeCommand: CommandDefinition = {
  name: "tree",
  description: "Display directory tree structure",
  usage: "tree [-L n] [path]",
  category: "navigation",
  execute(ctx, argv) {
    const vfs = getVirtualFilesystem();
    const levelFlag = argv.findIndex((arg) => arg === "-L");
    const maxDepth = levelFlag >= 0 ? Number(argv[levelFlag + 1]) || 3 : 3;
    const pathArg = argv.find((arg, i) => !arg.startsWith("-") && i !== levelFlag + 1);

    const resolved = resolvePathArg(ctx, pathArg);
    if (resolved.error) return resolved.error;

    const node = vfs.getNode(resolved.path);
    if (!node) {
      return error(`tree: ${pathArg ?? resolved.path}: No such file or directory`);
    }

    if (node.type === "file") {
      return success(stdout(node.name));
    }

    const root: AsciiTreeNode = {
      type: "dir",
      name: resolved.path,
      children: Object.values(node.children)
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((child) => vfsToAscii(child, maxDepth, 1)),
    };
    const rendered = ascii.tree(root, { maxDepth });

    return success(rendered.flatMap((l) => stdout(l)));
  },
};
