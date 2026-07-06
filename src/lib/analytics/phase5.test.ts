import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import { loadSiteConfig, getSiteUrl } from "@/lib/content/site";
import { loadProjects, getProjectReadme } from "@/lib/content/projects";
import { track, trackCommand } from "@/lib/analytics/track";

describe("phase 5 — content & launch", () => {
  it("loads site config", () => {
    const site = loadSiteConfig();
    expect(site.name).toBe("ROOT OS");
    expect(site.description.length).toBeGreaterThan(10);
  });

  it("loads enriched projects with links", () => {
    const projects = loadProjects();
    expect(projects.length).toBeGreaterThanOrEqual(2);
    expect(projects[0]?.links?.demo || projects[0]?.links?.repo).toBeTruthy();
  });

  it("loads project readmes from content-data bundle", () => {
    const readme = getProjectReadme("root-os");
    expect(readme).toContain("xterm.js");
  });

  it("resolves site URL with env fallback", () => {
    expect(getSiteUrl()).toMatch(/^https?:\/\//);
  });
});

describe("analytics", () => {
  beforeEach(() => {
    vi.stubGlobal("sessionStorage", {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("dispatches custom event on track", () => {
    const handler = vi.fn();
    window.addEventListener("rootos:analytics", handler);
    track("boot_complete");
    expect(handler).toHaveBeenCalled();
    window.removeEventListener("rootos:analytics", handler);
  });

  it("tracks command events with cmd_ prefix", () => {
    const handler = vi.fn();
    window.addEventListener("rootos:analytics", handler);
    trackCommand("whoami");
    expect(handler.mock.calls[0]?.[0]?.detail?.event).toBe("cmd_whoami");
    window.removeEventListener("rootos:analytics", handler);
  });
});
