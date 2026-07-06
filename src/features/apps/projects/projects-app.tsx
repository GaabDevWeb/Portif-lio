"use client";

import { motion } from "motion/react";

import { getProjectBySlug, getProjectReadme, loadProjects } from "@/lib/content/projects";
import { cn } from "@/lib/utils";
import { useSessionStore } from "@/providers/session-store";

export function ProjectsApp() {
  const selectedSlug = useSessionStore((s) => s.selectedProjectSlug);
  const setSelectedProject = useSessionStore((s) => s.setSelectedProject);
  const projects = loadProjects();
  const selected = selectedSlug ? getProjectBySlug(selectedSlug) : projects[0] ?? null;

  return (
    <div className="flex h-full min-h-[280px]">
      <aside className="w-2/5 min-w-[160px] border-r border-[var(--ui-border)]">
        <ul className="divide-y divide-[var(--ui-border)]">
          {projects.map((project) => (
            <li key={project.slug}>
              <button
                type="button"
                onClick={() => setSelectedProject(project.slug)}
                className={cn(
                  "w-full cursor-pointer px-3 py-2 text-left font-mono text-sm transition-colors hover:bg-[var(--bg-terminal)]",
                  selected?.slug === project.slug
                    ? "border-l-2 border-[var(--phosphor-primary)] bg-[var(--bg-terminal)] text-[var(--phosphor-primary)]"
                    : "text-[var(--phosphor-dim)]",
                )}
              >
                <span className="block truncate">{project.title}</span>
                <span className="text-xs opacity-70">{project.year}</span>
              </button>
            </li>
          ))}
        </ul>
      </aside>
      <motion.section
        key={selected?.slug}
        layout
        transition={{ duration: 0.25 }}
        className="flex-1 overflow-auto p-4"
      >
        {selected ? (
          <>
            <h2 className="font-mono text-lg text-[var(--phosphor-primary)]">{selected.title}</h2>
            <p className="mt-1 text-xs text-[var(--phosphor-dim)]">
              {selected.role} · {selected.year}
            </p>
            <p className="mt-3 text-sm text-[var(--ui-text)]">{selected.summary}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {selected.stack.map((tech) => (
                <span
                  key={tech}
                  className="rounded-sm border border-[var(--ui-border)] px-2 py-0.5 font-mono text-xs text-[var(--phosphor-dim)]"
                >
                  {tech}
                </span>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              {selected.links?.demo && (
                <a
                  href={selected.links.demo}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-xs text-[var(--accent-link)] hover:brightness-110"
                >
                  demo →
                </a>
              )}
              {selected.links?.repo && (
                <a
                  href={selected.links.repo}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-xs text-[var(--accent-link)] hover:brightness-110"
                >
                  repo →
                </a>
              )}
            </div>
            <pre className="mt-4 whitespace-pre-wrap font-mono text-xs text-[var(--phosphor-dim)]">
              {getProjectReadme(selected.slug)}
            </pre>
          </>
        ) : (
          <p className="font-mono text-sm text-[var(--phosphor-dim)]">No projects loaded.</p>
        )}
      </motion.section>
    </div>
  );
}
