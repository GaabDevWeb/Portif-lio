import { describe, expect, it } from "vitest";

import { formatGitLog, loadTimeline } from "@/lib/content/timeline";
import {
  buildGraphIndices,
  formatKnowledgeIndexOutput,
  getGraphStats,
  getHighlightSubgraph,
  loadKnowledgeGraph,
} from "@/lib/content/knowledge-graph";
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

describe("knowledge graph content", () => {
  it("loads nodes and links", () => {
    const graph = loadKnowledgeGraph();
    expect(graph.nodes.length).toBeGreaterThan(20);
    expect(graph.links.length).toBeGreaterThan(20);
    expect(graph.nodes.some((n) => n.id === "project:root-os")).toBe(true);
  });

  it("builds adjacency indices", () => {
    const indices = buildGraphIndices();
    const neighbors = indices.neighbors.get("project:root-os");
    expect(neighbors?.size).toBeGreaterThan(3);
    expect(indices.projectSlugToNodeId.get("root-os")).toBe("project:root-os");
  });

  it("highlights direct subgraph", () => {
    const indices = buildGraphIndices();
    const sub = getHighlightSubgraph("project:root-os", indices, 1);
    expect(sub.nodes.has("project:root-os")).toBe(true);
    expect(sub.nodes.size).toBeGreaterThan(1);
    expect(sub.links.size).toBeGreaterThan(0);
  });

  it("formats index output", () => {
    const lines = formatKnowledgeIndexOutput();
    expect(lines[0]).toContain("Knowledge graph");
    expect(getGraphStats().nodes).toBeGreaterThan(0);
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
    expect(names).toContain("knowledge");
  });

  it("resolves man page", () => {
    const page = getManPage("git");
    expect(page?.synopsis).toContain("git log");
  });
});
