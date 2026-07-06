import graphData from "../../../content/knowledge-graph.json";

export type KGNodeType =
  | "project"
  | "skill"
  | "technology"
  | "tool"
  | "concept"
  | "language"
  | "framework";

export type KGColorToken = "primary" | "accent" | "dim" | "amber" | "text" | "muted" | "link";

export interface KGNodeRefs {
  projectSlug?: string;
}

export interface KGNode {
  id: string;
  title: string;
  type: KGNodeType;
  description: string;
  icon: string;
  color: KGColorToken;
  level?: number;
  years?: number;
  relatedProjects: string[];
  connections: string[];
  refs?: KGNodeRefs;
}

export interface KGLink {
  id: string;
  source: string;
  target: string;
  kind: string;
}

export interface KGMetadata {
  version: string;
  generatedAt: string;
  seed: number;
  algorithm: string;
}

export interface KnowledgeGraph {
  metadata: KGMetadata;
  nodes: KGNode[];
  links: KGLink[];
}

export interface KnowledgeGraphIndices {
  nodesById: Map<string, KGNode>;
  neighbors: Map<string, Set<string>>;
  linksByNode: Map<string, KGLink[]>;
  projectSlugToNodeId: Map<string, string>;
}

const parsed = graphData as KnowledgeGraph;

export function loadKnowledgeGraph(): KnowledgeGraph {
  return parsed;
}

export function getGraphStats(graph: KnowledgeGraph = loadKnowledgeGraph()) {
  return {
    nodes: graph.nodes.length,
    edges: graph.links.length,
    version: graph.metadata.version,
  };
}

export function buildGraphIndices(graph: KnowledgeGraph = loadKnowledgeGraph()): KnowledgeGraphIndices {
  const nodesById = new Map<string, KGNode>();
  const neighbors = new Map<string, Set<string>>();
  const linksByNode = new Map<string, KGLink[]>();
  const projectSlugToNodeId = new Map<string, string>();

  for (const node of graph.nodes) {
    nodesById.set(node.id, node);
    neighbors.set(node.id, new Set());
    linksByNode.set(node.id, []);

    if (node.refs?.projectSlug) {
      projectSlugToNodeId.set(node.refs.projectSlug, node.id);
    }
  }

  for (const link of graph.links) {
    neighbors.get(link.source)?.add(link.target);
    neighbors.get(link.target)?.add(link.source);
    linksByNode.get(link.source)?.push(link);
    linksByNode.get(link.target)?.push(link);
  }

  return { nodesById, neighbors, linksByNode, projectSlugToNodeId };
}

export function getHighlightSubgraph(
  nodeId: string,
  indices: KnowledgeGraphIndices,
  depth = 1,
): { nodes: Set<string>; links: Set<string> } {
  const nodes = new Set<string>([nodeId]);
  let frontier = [nodeId];

  for (let d = 0; d < depth; d++) {
    const next: string[] = [];
    for (const id of frontier) {
      for (const neighbor of indices.neighbors.get(id) ?? []) {
        if (!nodes.has(neighbor)) {
          nodes.add(neighbor);
          next.push(neighbor);
        }
      }
    }
    frontier = next;
  }

  const links = new Set<string>();
  for (const link of loadKnowledgeGraph().links) {
    if (nodes.has(link.source) && nodes.has(link.target)) {
      links.add(link.id);
    }
  }

  return { nodes, links };
}

export function formatKnowledgeIndexOutput(graph: KnowledgeGraph = loadKnowledgeGraph()): string[] {
  const stats = getGraphStats(graph);
  return [
    `Knowledge graph v${stats.version}`,
    `Nodes: ${stats.nodes} · Edges: ${stats.edges}`,
    `Algorithm: ${graph.metadata.algorithm}`,
    "",
    "Run `goto knowledge` to render the graph.",
  ];
}
