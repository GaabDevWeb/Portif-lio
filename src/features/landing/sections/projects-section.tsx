"use client";

import { ModulePanel } from "@/features/landing/components/module-panel";
import { ProjectCard } from "@/features/landing/components/project-card";
import { loadProjects } from "@/lib/content/projects";
import { useSessionStore } from "@/providers/session-store";

export function ProjectsSection() {
  const projects = loadProjects();
  const openProject = useSessionStore((s) => s.openProject);
  const emitSync = useSessionStore((s) => s.emitSync);

  const handleOpen = (slug: string) => {
    emitSync({ type: "section.goto", origin: "landing", section: "projects" });
    openProject(slug, "landing");
  };

  return (
    <div className="mx-auto max-w-6xl px-4 md:px-8" style={{ paddingBlock: "var(--section-padding-y)" }}>
      <div data-reveal>
        <ModulePanel id="projects" code="MOD-PROJECTS" title="~/projects/">
          <p className="mb-6 font-mono text-sm text-[var(--phosphor-dim)]">
            Select a package to launch as system application.
          </p>
          <div
            id="projects-grid"
            className="grid gap-3 md:grid-cols-2"
          >
            {projects.map((project) => (
              <ProjectCard key={project.slug} project={project} onOpen={handleOpen} />
            ))}
          </div>
        </ModulePanel>
      </div>
    </div>
  );
}
