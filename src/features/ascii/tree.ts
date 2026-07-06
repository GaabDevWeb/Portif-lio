export type AsciiTreeNode =
  | { type: "file"; name: string }
  | { type: "dir"; name: string; children: AsciiTreeNode[] };

export function renderTree(
  root: AsciiTreeNode,
  opts: { maxDepth?: number } = {},
): string[] {
  const maxDepth = opts.maxDepth ?? 6;
  const out: string[] = [];

  function walk(node: AsciiTreeNode, prefix: string, depth: number, isLast: boolean) {
    const branch = prefix ? (isLast ? "└── " : "├── ") : "";
    out.push(`${prefix}${branch}${node.name}`);

    if (node.type !== "dir") return;
    if (depth >= maxDepth) return;

    const nextPrefix = prefix + (prefix ? (isLast ? "    " : "│   ") : "");
    const children = node.children ?? [];
    children.forEach((child, idx) => {
      walk(child, nextPrefix, depth + 1, idx === children.length - 1);
    });
  }

  walk(root, "", 0, true);
  return out;
}

