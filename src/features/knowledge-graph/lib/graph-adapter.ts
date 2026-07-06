import type { KnowledgeGraph } from "@/lib/content/knowledge-graph";
import type { ForceGraphData } from "../types";

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const TYPE_REVEAL_ORDER: Record<string, number> = {
  project: 0,
  framework: 1,
  technology: 2,
  language: 3,
  skill: 4,
  tool: 5,
  concept: 6,
};

export function adaptGraphData(graph: KnowledgeGraph): ForceGraphData {
  const rand = seededRandom(graph.metadata.seed);
  const spread = 420;

  const nodes = graph.nodes.map((node, index) => {
    const order = TYPE_REVEAL_ORDER[node.type] ?? 5;
    return {
      id: node.id,
      title: node.title,
      type: node.type,
      description: node.description,
      icon: node.icon,
      color: node.color,
      level: node.level,
      years: node.years,
      relatedProjects: node.relatedProjects,
      projectSlug: node.refs?.projectSlug,
      revealIndex: order * 10 + index,
      x: (rand() - 0.5) * spread,
      y: (rand() - 0.5) * spread,
    };
  });

  const links = graph.links.map((link) => ({
    id: link.id,
    source: link.source,
    target: link.target,
    kind: link.kind,
  }));

  return { nodes, links };
}
