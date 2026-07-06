import { getProjectBySlug } from "@/lib/content/projects";
import type { AppId, CoreAppId } from "@/types/root-os";

const CORE_APP_TITLES: Record<CoreAppId, string> = {
  terminal: "Terminal.app",
  media: "Media.app",
  profile: "Profile.app",
  projects: "Projects.app",
  editor: "Editor.app",
  timeline: "Timeline.app",
  monitor: "Monitor.app",
  mail: "Mail.app",
  finder: "Finder.app",
  resume: "Resume.app",
  architecture: "Arch.app",
  help: "Man.app",
};

export function isProjectAppId(appId: AppId): appId is `project-${string}` {
  return appId.startsWith("project-");
}

export function projectAppId(slug: string): AppId {
  return `project-${slug}` as AppId;
}

export function getProjectSlugFromAppId(appId: AppId): string | null {
  if (!isProjectAppId(appId)) return null;
  return appId.slice("project-".length);
}

export function getAppTitle(appId: AppId): string {
  if (isProjectAppId(appId)) {
    const slug = getProjectSlugFromAppId(appId);
    if (!slug) return "Project.app";
    const project = getProjectBySlug(slug);
    return project ? `${project.title}.app` : `${slug}.app`;
  }
  return CORE_APP_TITLES[appId as CoreAppId] ?? `${appId}.app`;
}

export function isCoreAppId(appId: AppId): appId is CoreAppId {
  return !isProjectAppId(appId);
}
