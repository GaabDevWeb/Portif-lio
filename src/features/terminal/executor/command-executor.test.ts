import { describe, expect, it } from "vitest";

import { SYSTEM } from "@/constants/system";
import { executeInput } from "@/features/terminal/executor/command-executor";
import type { CommandContext } from "@/types/root-os";

const baseContext: CommandContext = {
  cwd: SYSTEM.homeDir,
  user: SYSTEM.defaultUser,
  isRoot: false,
  hostname: SYSTEM.hostname,
  homeDir: SYSTEM.homeDir,
  history: [],
  openApps: [],
  focusedApp: null,
  chaptersComplete: [],
  easterEggs: [],
  activeSection: "hero",
};

describe("command executor", () => {
  it("executes whoami", async () => {
    const result = await executeInput("whoami", baseContext);
    expect(result.exitCode).toBe(0);
    expect(result.lines.some((l) => l.text.includes("guest"))).toBe(true);
  });

  it("executes ls", async () => {
    const result = await executeInput("ls", baseContext);
    expect(result.exitCode).toBe(0);
    expect(result.lines[0]?.text).toContain("manifesto.md");
  });

  it("returns not found for unknown command", async () => {
    const result = await executeInput("unknowncmd", baseContext);
    expect(result.exitCode).toBe(127);
  });

  it("executes cd to projects", async () => {
    const result = await executeInput("cd projects", baseContext);
    expect(result.exitCode).toBe(0);
    expect(result.cwd).toBe(`${SYSTEM.homeDir}/projects`);
    expect(result.openApp).toBe("projects");
  });

  it("executes contact", async () => {
    const result = await executeInput("contact", baseContext);
    expect(result.exitCode).toBe(0);
    expect(result.gotoSection).toBe("contact");
  });

  it("executes projects", async () => {
    const result = await executeInput("projects", baseContext);
    expect(result.exitCode).toBe(0);
    expect(result.gotoSection).toBe("projects");
  });

  it("executes git log", async () => {
    const result = await executeInput("git log", baseContext);
    expect(result.exitCode).toBe(0);
    expect(result.openApp).toBe("timeline");
    expect(result.chapterComplete).toBe(7);
  });

  it("executes top", async () => {
    const result = await executeInput("top", baseContext);
    expect(result.exitCode).toBe(0);
    expect(result.openApp).toBe("monitor");
    expect(result.chapterComplete).toBe(8);
  });

  it("executes man ls", async () => {
    const result = await executeInput("man ls", baseContext);
    expect(result.exitCode).toBe(0);
    expect(result.lines.some((l) => l.text.includes("SYNOPSIS"))).toBe(true);
  });

  it("executes shutdown with activity", async () => {
    const ctx = { ...baseContext, chaptersComplete: [2] };
    const result = await executeInput("shutdown", ctx);
    expect(result.exitCode).toBe(0);
    expect(result.shutdown).toBe(true);
    expect(result.chapterComplete).toBe(10);
  });

  it("rejects shutdown without activity", async () => {
    const result = await executeInput("shutdown", baseContext);
    expect(result.exitCode).toBe(1);
    expect(result.shutdown).toBeUndefined();
  });
});
