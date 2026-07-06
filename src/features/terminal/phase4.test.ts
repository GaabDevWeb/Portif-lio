import { describe, expect, it } from "vitest";

import { expandAliases } from "@/features/terminal/aliases";
import { EASTER_COMMANDS } from "@/features/terminal/commands/easter";
import { executeInput } from "@/features/terminal/executor/command-executor";
import { getCommandRegistry } from "@/features/terminal/registry/command-registry";
import { loadEasterEggRegistry } from "@/lib/easter/content";
import { SYSTEM } from "@/constants/system";
import type { CommandContext } from "@/types/root-os";

const ctx: CommandContext = {
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

describe("phase 4 — easter eggs", () => {
  it("registers 30+ easter egg commands", () => {
    expect(EASTER_COMMANDS.length).toBeGreaterThanOrEqual(30);
  });

  it("loads easter egg registry from content", () => {
    expect(loadEasterEggRegistry().length).toBeGreaterThanOrEqual(30);
  });

  it("executes cowsay with easterEgg id", async () => {
    const result = await executeInput("cowsay hello", ctx);
    expect(result.exitCode).toBe(0);
    expect(result.easterEgg).toBe("cowsay");
  });

  it("executes matrix with visual effect", async () => {
    const result = await executeInput("matrix", ctx);
    expect(result.visualEffect).toBe("matrix");
    expect(result.easterEgg).toBe("matrix");
  });

  it("executes rm -rf / safely", async () => {
    const result = await executeInput("rm -rf /", ctx);
    expect(result.exitCode).toBe(0);
    expect(result.lines.some((l) => l.text.includes("just kidding"))).toBe(true);
  });

  it("expands ll alias to ls -la", async () => {
    expect(expandAliases("ll")).toBe("ls -la");
    const result = await executeInput("ll", ctx);
    expect(result.exitCode).toBe(0);
  });

  it("registry has 50+ unique commands", () => {
    expect(getCommandRegistry().list().length).toBeGreaterThanOrEqual(50);
  });
});
