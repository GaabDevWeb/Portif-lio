import { buildVfsTree } from "./content-loader";
import { VirtualFilesystem } from "./virtual-filesystem";

let vfsInstance: VirtualFilesystem | null = null;

export function getVirtualFilesystem(): VirtualFilesystem {
  if (!vfsInstance) {
    vfsInstance = new VirtualFilesystem(buildVfsTree());
  }
  return vfsInstance;
}

export function resetVirtualFilesystem(): void {
  vfsInstance = new VirtualFilesystem(buildVfsTree());
}
