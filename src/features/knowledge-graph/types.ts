export type GraphPhase =
  | "idle"
  | "booting"
  | "rendering"
  | "simulating"
  | "stable"
  | "interacting";

export interface GraphCamera {
  zoom: number;
}

export interface ForceGraphNode {
  id: string;
  title: string;
  type: string;
  description: string;
  icon: string;
  color: string;
  level?: number;
  years?: number;
  relatedProjects: string[];
  projectSlug?: string;
  revealIndex: number;
  x?: number;
  y?: number;
  fx?: number;
  fy?: number;
}

export interface ForceGraphLink {
  id: string;
  source: string;
  target: string;
  kind: string;
}

export interface ForceGraphData {
  nodes: ForceGraphNode[];
  links: ForceGraphLink[];
}
