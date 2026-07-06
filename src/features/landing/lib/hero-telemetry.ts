import { getGraphStats, loadKnowledgeGraph } from "@/lib/content/knowledge-graph";
import { loadProjects } from "@/lib/content/projects";
import { loadTimeline } from "@/lib/content/timeline";

export interface HeroTelemetry {
  projects: number;
  commits: number;
  years: number;
  stacks: number;
  nodes: number;
  experiments: number;
}

export function computeHeroTelemetry(): HeroTelemetry {
  const projects = loadProjects();
  const timeline = loadTimeline();
  const graphStats = getGraphStats(loadKnowledgeGraph());
  const stacks = new Set(projects.flatMap((p) => p.stack));
  const years = projects.map((p) => p.year);
  const minYear = years.length ? Math.min(...years) : new Date().getFullYear();
  const maxYear = years.length ? Math.max(...years) : new Date().getFullYear();

  return {
    projects: projects.length,
    commits: timeline.length,
    years: Math.max(1, maxYear - minYear + 1),
    stacks: stacks.size,
    nodes: graphStats.nodes,
    experiments: projects.filter((p) => p.featured).length,
  };
}
