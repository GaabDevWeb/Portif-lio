import { describe, expect, it, beforeEach } from "vitest";

import {
  createCommandRegistry,
  getCommandRegistry,
  resetCommandRegistry,
} from "@/features/terminal/registry/command-registry";
import { helpCommand } from "@/features/terminal/commands/help";

describe("CommandRegistry", () => {
  beforeEach(() => {
    resetCommandRegistry();
  });

  it("registers default commands", () => {
    const registry = getCommandRegistry();
    expect(registry.resolve("help")).toBeDefined();
    expect(registry.resolve("ls")).toBeDefined();
    expect(registry.resolve("whoami")).toBeDefined();
  });

  it("resolves aliases", () => {
    const registry = getCommandRegistry();
    expect(registry.resolve("?")).toBe(registry.resolve("help"));
  });

  it("lists unique commands", () => {
    const registry = createCommandRegistry([helpCommand]);
    expect(registry.list()).toHaveLength(1);
  });
});
