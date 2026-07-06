import { describe, expect, it, beforeEach } from "vitest";

import { buildVfsTree } from "@/features/vfs/content-loader";
import { VirtualFilesystem } from "@/features/vfs/virtual-filesystem";
import { SYSTEM } from "@/constants/system";

describe("VirtualFilesystem", () => {
  let vfs: VirtualFilesystem;

  beforeEach(() => {
    vfs = new VirtualFilesystem(buildVfsTree());
  });

  it("lists home guest directory", () => {
    const entries = vfs.listDirectory(SYSTEM.homeDir);
    expect(entries?.map((e) => e.name)).toContain("manifesto.md");
    expect(entries?.map((e) => e.name)).toContain("projects");
  });

  it("reads manifesto file", () => {
    const content = vfs.readFile(`${SYSTEM.homeDir}/manifesto.md`);
    expect(content).toContain("ROOT OS");
  });

  it("resolves relative paths", () => {
    const resolved = vfs.resolve("projects", SYSTEM.homeDir);
    expect(resolved).toBe(`${SYSTEM.homeDir}/projects`);
  });

  it("returns null for missing paths", () => {
    expect(vfs.readFile("/nonexistent")).toBeNull();
  });
});
