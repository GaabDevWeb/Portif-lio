"use client";

import { useRef } from "react";
import gsap from "gsap";

import type { ProjectMeta } from "@/types/root-os";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  project: ProjectMeta;
  onOpen: (slug: string) => void;
}

export function ProjectCard({ project, onOpen }: ProjectCardProps) {
  const barRef = useRef<HTMLSpanElement>(null);

  const handleEnter = () => {
    if (!barRef.current) return;
    gsap.to(barRef.current, { scaleY: 1, duration: 0.2, ease: "power2.out" });
  };

  const handleLeave = () => {
    if (!barRef.current) return;
    gsap.to(barRef.current, { scaleY: 0, duration: 0.15, ease: "power2.in" });
  };

  return (
    <button
      type="button"
      onClick={() => onOpen(project.slug)}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      className={cn(
        "group relative w-full cursor-pointer border border-[var(--ui-border)] bg-[var(--bg-void)] p-4 text-left transition-colors hover:bg-[var(--bg-panel)]",
        project.featured && "md:col-span-2",
      )}
    >
      <span
        ref={barRef}
        className="absolute top-0 left-0 h-full w-0.5 origin-top scale-y-0 bg-[var(--phosphor-primary)]"
        aria-hidden
      />
      <div className="flex items-start justify-between gap-2">
        <span className="font-mono text-[10px] text-[var(--phosphor-dim)]">
          {project.year}
        </span>
        <span className="font-mono text-[10px] text-[var(--amber-led)]">
          {project.featured ? "FEAT" : "APP"}
        </span>
      </div>
      <h3 className="mt-2 font-mono text-base text-[var(--ui-text)] group-hover:text-[var(--phosphor-primary)]">
        {project.title}
      </h3>
      <p className="mt-2 line-clamp-2 text-sm text-[var(--ui-text-dim)]">
        {project.summary}
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {project.stack.slice(0, 4).map((tech) => (
          <span
            key={tech}
            className="border border-[var(--ui-border)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--phosphor-dim)]"
          >
            {tech}
          </span>
        ))}
      </div>
    </button>
  );
}

interface MetricBarProps {
  label: string;
  value: number;
  process?: string;
}

export function MetricBar({ label, value, process }: MetricBarProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between font-mono text-xs">
        <span className="text-[var(--ui-text)]">{label}</span>
        <span className="text-[var(--phosphor-primary)] tabular-nums">{value}%</span>
      </div>
      <div className="h-1.5 border border-[var(--ui-border)] bg-[var(--bg-void)]">
        <div
          className="metric-bar-fill h-full bg-[var(--phosphor-primary)]"
          style={{ width: `${value}%` }}
          data-process={process}
        />
      </div>
    </div>
  );
}
