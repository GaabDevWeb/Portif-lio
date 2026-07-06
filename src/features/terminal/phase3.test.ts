import { describe, expect, it } from "vitest";

import { formatGitLog, loadTimeline } from "@/lib/content/timeline";
import { formatTopOutput, loadSkills } from "@/lib/content/skills";
import { getManPage, getManPageNames } from "@/features/terminal/man/man-pages";

describe("timeline content", () => {
  it("loads commits", () => {
    const commits = loadTimeline();
    expect(commits.length).toBeGreaterThan(0);
    expect(commits[0]).toHaveProperty("hash");
  });

  it("formats git log blocks", () => {
    const blocks = formatGitLog(loadTimeline());
    expect(blocks[0]).toContain("commit");
  });
});

describe("skills content", () => {
  it("loads skills as processes", () => {
    const skills = loadSkills();
    expect(skills.some((s) => s.name === "gsap")).toBe(true);
  });

  it("formats top output", () => {
    const lines = formatTopOutput(loadSkills());
    expect(lines[0]).toContain("PID");
  });
});

describe("man pages", () => {
  it("includes core commands", () => {
    const names = getManPageNames();
    expect(names).toContain("ls");
    expect(names).toContain("shutdown");
  });

  it("resolves man page", () => {
    const page = getManPage("git");
    expect(page?.synopsis).toContain("git log");
  });
});
