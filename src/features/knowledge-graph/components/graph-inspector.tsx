"use client";

import { X } from "lucide-react";

import {
  buildGraphIndices,
  type KGNode,
  type KGNodeType,
} from "@/lib/content/knowledge-graph";
import { getProjectBySlug } from "@/lib/content/projects";
import { cn } from "@/lib/utils";

const TYPE_LABELS: Record<KGNodeType, string> = {
  project: "Project",
  skill: "Skill",
  technology: "Technology",
  tool: "Tool",
  concept: "Concept",
  language: "Language",
  framework: "Framework",
};

interface GraphInspectorProps {
  node: KGNode | null;
  onClose: () => void;
  onOpenProject: (slug: string) => void;
  onFocusNode: (id: string) => void;
  className?: string;
}

export function GraphInspector({
  node,
  onClose,
  onOpenProject,
  onFocusNode,
  className,
}: GraphInspectorProps) {
  if (!node) return null;

  const indices = buildGraphIndices();
  const neighbors = [...(indices.neighbors.get(node.id) ?? [])]
    .map((id) => indices.nodesById.get(id))
    .filter((n): n is KGNode => Boolean(n));

  const relatedProjects = node.relatedProjects
    .map((id) => indices.nodesById.get(id))
    .filter((n): n is KGNode => Boolean(n));

  const technologies = neighbors.filter(
    (n) => n.type === "technology" || n.type === "framework" || n.type === "language",
  );

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-l border-[var(--ui-border)] bg-[var(--bg-panel)]",
        className,
      )}
      aria-label={`Details for ${node.title}`}
    >
      <header className="flex items-center justify-between border-b border-[var(--ui-border)] px-4 py-2">
        <div>
          <p className="font-mono text-[10px] tracking-widest text-[var(--phosphor-dim)] uppercase">
            {TYPE_LABELS[node.type]}
          </p>
          <h3 className="font-mono text-sm text-[var(--ui-text)]">{node.title}</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close inspector"
          className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center text-[var(--phosphor-dim)] hover:text-[var(--ui-text)]"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto p-4 font-mono text-xs">
        <p className="leading-relaxed text-[var(--ui-text-dim)]">{node.description}</p>

        {(node.level != null || node.years != null) && (
          <div className="grid grid-cols-2 gap-2">
            {node.level != null && (
              <div className="border border-[var(--ui-border)] px-2 py-1.5">
                <p className="text-[10px] text-[var(--phosphor-dim)]">DOMAIN</p>
                <p className="text-[var(--phosphor-primary)]">{node.level}%</p>
              </div>
            )}
            {node.years != null && (
              <div className="border border-[var(--ui-border)] px-2 py-1.5">
                <p className="text-[10px] text-[var(--phosphor-dim)]">YEARS</p>
                <p className="text-[var(--phosphor-primary)]">{node.years}</p>
              </div>
            )}
          </div>
        )}

        {technologies.length > 0 && (
          <div>
            <p className="mb-2 text-[10px] tracking-wider text-[var(--phosphor-dim)] uppercase">
              Technologies
            </p>
            <ul className="space-y-1">
              {technologies.map((tech) => (
                <li key={tech.id}>
                  <button
                    type="button"
                    onClick={() => onFocusNode(tech.id)}
                    className="cursor-pointer text-[var(--ui-text)] hover:text-[var(--phosphor-primary)]"
                  >
                    {tech.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {relatedProjects.length > 0 && (
          <div>
            <p className="mb-2 text-[10px] tracking-wider text-[var(--phosphor-dim)] uppercase">
              Related Projects
            </p>
            <ul className="space-y-1">
              {relatedProjects.map((project) => (
                <li key={project.id}>
                  <button
                    type="button"
                    onClick={() => {
                      const slug = project.refs?.projectSlug;
                      if (slug) onOpenProject(slug);
                    }}
                    className="cursor-pointer text-[var(--phosphor-primary)] hover:underline"
                  >
                    {project.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {neighbors.length > 0 && (
          <div>
            <p className="mb-2 text-[10px] tracking-wider text-[var(--phosphor-dim)] uppercase">
              Connections ({neighbors.length})
            </p>
            <ul className="max-h-32 space-y-1 overflow-y-auto">
              {neighbors.slice(0, 12).map((neighbor) => (
                <li key={neighbor.id}>
                  <button
                    type="button"
                    onClick={() => onFocusNode(neighbor.id)}
                    className="cursor-pointer text-[var(--ui-text-dim)] hover:text-[var(--phosphor-primary)]"
                  >
                    {neighbor.title}
                    <span className="ml-1 text-[var(--phosphor-dim)]">· {neighbor.type}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {node.refs?.projectSlug && (
          <button
            type="button"
            onClick={() => onOpenProject(node.refs!.projectSlug!)}
            className="mt-2 min-h-11 w-full cursor-pointer border border-[var(--phosphor-primary)] px-3 py-2 text-[var(--phosphor-primary)] transition-[filter] hover:brightness-110"
          >
            Launch {getProjectBySlug(node.refs.projectSlug)?.title ?? "Project"}
          </button>
        )}

        <button
          type="button"
          onClick={() => onFocusNode(node.id)}
          className="min-h-11 w-full cursor-pointer border border-[var(--ui-border)] px-3 py-2 text-[var(--ui-text-dim)] hover:border-[var(--phosphor-dim)] hover:text-[var(--ui-text)]"
        >
          Focus in graph
        </button>
      </div>
    </aside>
  );
}
