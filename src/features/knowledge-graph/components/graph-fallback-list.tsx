"use client";

import { loadKnowledgeGraph, type KGNodeType } from "@/lib/content/knowledge-graph";
import { cn } from "@/lib/utils";

const TYPE_ORDER: KGNodeType[] = [
  "project",
  "skill",
  "framework",
  "technology",
  "language",
  "tool",
  "concept",
];

interface GraphFallbackListProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
  className?: string;
}

export function GraphFallbackList({ selectedId, onSelect, className }: GraphFallbackListProps) {
  const graph = loadKnowledgeGraph();

  return (
    <div
      className={cn(
        "max-h-48 overflow-y-auto border-t border-[var(--ui-border)] bg-[var(--bg-void)] p-3",
        className,
      )}
      role="listbox"
      aria-label="Knowledge graph node index"
    >
      {TYPE_ORDER.map((type) => {
        const nodes = graph.nodes.filter((n) => n.type === type);
        if (nodes.length === 0) return null;

        return (
          <div key={type} className="mb-3">
            <p className="mb-1 font-mono text-[10px] tracking-wider text-[var(--phosphor-dim)] uppercase">
              {type}
            </p>
            <ul className="space-y-0.5">
              {nodes.map((node) => (
                <li key={node.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={selectedId === node.id}
                    onClick={() => onSelect(node.id)}
                    className={cn(
                      "min-h-11 w-full cursor-pointer px-2 py-1 text-left font-mono text-xs transition-colors",
                      selectedId === node.id
                        ? "bg-[var(--bg-panel)] text-[var(--phosphor-primary)]"
                        : "text-[var(--ui-text-dim)] hover:text-[var(--ui-text)]",
                    )}
                  >
                    {node.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
