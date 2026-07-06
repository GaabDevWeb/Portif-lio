import { SYSTEM } from "@/constants/system";
import { normalizePath, splitPath } from "@/lib/utils";
import type {
  VfsDirectoryNode,
  VfsFileNode,
  VfsNode,
} from "@/types/root-os";

export class VirtualFilesystem {
  private root: VfsNode;

  constructor(root: VfsNode) {
    this.root = root;
  }

  resolve(path: string, cwd: string): string {
    return normalizePath(cwd, path, SYSTEM.homeDir);
  }

  getNode(absolutePath: string): VfsNode | null {
    if (absolutePath === "/") return this.root;

    const parts = splitPath(absolutePath);
    let current: VfsNode = this.root;

    for (const part of parts) {
      if (current.type !== "directory") return null;
      const next = current.children[part];
      if (!next) return null;
      current = next;
    }

    return current;
  }

  listDirectory(absolutePath: string): VfsNode[] | null {
    const node = this.getNode(absolutePath);
    if (!node || node.type !== "directory") return null;
    return Object.values(node.children).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }

  readFile(absolutePath: string): string | null {
    const node = this.getNode(absolutePath);
    if (!node || node.type !== "file") return null;
    return node.content;
  }

  isDirectory(absolutePath: string): boolean {
    const node = this.getNode(absolutePath);
    return node?.type === "directory";
  }

  isFile(absolutePath: string): boolean {
    const node = this.getNode(absolutePath);
    return node?.type === "file";
  }

  exists(absolutePath: string): boolean {
    return this.getNode(absolutePath) !== null;
  }

  getRoot(): VfsNode {
    return this.root;
  }
}

export function isDirectoryNode(node: VfsNode): node is VfsDirectoryNode {
  return node.type === "directory";
}

export function isFileNode(node: VfsNode): node is VfsFileNode {
  return node.type === "file";
}
