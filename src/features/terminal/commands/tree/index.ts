import { getVirtualFilesystem } from "@/features/vfs";
import type { CommandDefinition, VfsNode } from "@/types/root-os";
import { error, resolvePathArg, success, stdout } from "../shared";

function buildTreeLines(
  node: VfsNode,
  prefix: string,
  isLast: boolean,
  depth: number,
  maxDepth: number,
): string[] {
  if (depth > maxDepth) return [];

  const connector = isLast ? "└── " : "├── ";
  const lines = [`${prefix}${connector}${node.name}${node.type === "directory" ? "/" : ""}`];

  if (node.type !== "directory") return lines;

  const childPrefix = prefix + (isLast ? "    " : "│   ");
  const children = Object.values(node.children).sort((a, b) => a.name.localeCompare(b.name));

  children.forEach((child, index) => {
    lines.push(
      ...buildTreeLines(child, childPrefix, index === children.length - 1, depth + 1, maxDepth),
    );
  });

  return lines;
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

    const header = stdout(resolved.path);
    const body = Object.values(node.children)
      .sort((a, b) => a.name.localeCompare(b.name))
      .flatMap((child, index, arr) =>
        buildTreeLines(child, "", index === arr.length - 1, 1, maxDepth),
      );

    return success([...header, ...body.map((text) => ({ stream: "stdout" as const, text }))]);
  },
};
