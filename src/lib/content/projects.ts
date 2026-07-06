import projectsIndex from "../../../content/projects/index.json";
import { projectReadmes } from "@/content-data/projects";
import type { ProjectMeta } from "@/types/root-os";

export function loadProjects(): ProjectMeta[] {
  return projectsIndex as ProjectMeta[];
}

export function getProjectBySlug(slug: string): ProjectMeta | undefined {
  return loadProjects().find((p) => p.slug === slug);
}

export function getProjectReadme(slug: string): string {
  return projectReadmes[slug] ?? `# ${slug}\n\nREADME not found.`;
}
