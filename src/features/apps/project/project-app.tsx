"use client";

import { getProjectBySlug, getProjectReadme } from "@/lib/content/projects";
import { getProjectSlugFromAppId } from "@/lib/app-id";
import type { AppId } from "@/types/root-os";

interface ProjectAppProps {
  appId: AppId;
}

export function ProjectApp({ appId }: ProjectAppProps) {
  const slug = getProjectSlugFromAppId(appId);
  if (!slug) return null;

  const project = getProjectBySlug(slug);
  const readme = getProjectReadme(slug);

  if (!project) {
    return (
      <p className="p-4 font-mono text-sm text-[var(--stderr)]">
        Project not found: {slug}
      </p>
    );
  }

  const body = readme
    .replace(/^# .+\n+/m, "")
    .trim()
    .split("\n")
    .filter((line) => line.trim());

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-[var(--ui-border)] px-4 py-3">
        <h2 className="font-mono text-lg text-[var(--phosphor-primary)]">{project.title}</h2>
        <p className="mt-1 font-mono text-xs text-[var(--phosphor-dim)]">
          {project.role} · {project.year}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {project.stack.map((tech) => (
            <span
              key={tech}
              className="border border-[var(--ui-border)] px-2 py-0.5 font-mono text-[10px] text-[var(--phosphor-dim)]"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <p className="mb-4 text-sm text-[var(--ui-text)]">{project.summary}</p>
        <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-[var(--ui-text-dim)]">
          {body.join("\n")}
        </pre>
        <div className="mt-6 flex flex-wrap gap-4 border-t border-[var(--ui-border)] pt-4">
          {project.links?.demo && (
            <a
              href={project.links.demo}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-xs text-[var(--accent-data)] hover:brightness-110"
            >
              demo →
            </a>
          )}
          {project.links?.repo && (
            <a
              href={project.links.repo}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-xs text-[var(--accent-data)] hover:brightness-110"
            >
              repo →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
