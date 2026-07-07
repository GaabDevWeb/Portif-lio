import rootOsDetail from "../../../content/projects/root-os/detail.json";
import designSystemDetail from "../../../content/projects/design-system/detail.json";
import { rootOsProjectHeroAscii } from "@/content-data/projects/root-os-hero-ascii";
import { rootOsProjectFooterAscii } from "@/content-data/projects/root-os-footer-ascii";
import {
  designSystemProjectFooterAscii,
  designSystemProjectHeroAscii,
} from "@/content-data/projects/design-system-ascii";
import type { ProjectDetail, ProjectPageData } from "@/features/project-page/types";
import { getProjectBySlug } from "@/lib/content/projects";

const DETAILS: Record<string, ProjectDetail> = {
  "root-os": rootOsDetail as ProjectDetail,
  "design-system": designSystemDetail as ProjectDetail,
};

const TITLE_ASCII: Record<string, string> = {
  "root-os-hero": rootOsProjectHeroAscii,
  "design-system-hero": designSystemProjectHeroAscii,
};

const FOOTER_ASCII: Record<string, string> = {
  "root-os-footer": rootOsProjectFooterAscii,
  "design-system-footer": designSystemProjectFooterAscii,
};

function resolveTitleAsciiKey(hero: ProjectDetail["hero"]): string {
  return hero.titleAsciiKey ?? hero.asciiSourceKey ?? "";
}

export function getAllProjectSlugs(): string[] {
  return Object.keys(DETAILS);
}

export function getProjectDetail(slug: string): ProjectDetail | undefined {
  return DETAILS[slug];
}

export function loadProjectPage(slug: string): ProjectPageData | undefined {
  const meta = getProjectBySlug(slug);
  const detail = getProjectDetail(slug);
  if (!meta || !detail) return undefined;

  const titleKey = resolveTitleAsciiKey(detail.hero);
  const titleAscii = TITLE_ASCII[titleKey];
  const footerAscii = FOOTER_ASCII[detail.footer.asciiSourceKey];
  if (!titleAscii || !footerAscii) return undefined;

  let heroVisualAscii: string | undefined;
  const hasHeroMedia = Boolean(detail.hero.heroVideo ?? detail.hero.heroGif);
  if (!hasHeroMedia) {
    const visualKey = detail.hero.interactiveAsciiKey ?? titleKey;
    heroVisualAscii = TITLE_ASCII[visualKey];
    if (!heroVisualAscii) return undefined;
  } else if (detail.hero.interactiveAsciiKey) {
    heroVisualAscii = TITLE_ASCII[detail.hero.interactiveAsciiKey];
  }

  const panels = [...detail.architecture.panels].sort((a, b) => a.order - b.order);

  return {
    meta,
    detail: {
      ...detail,
      architecture: { panels },
    },
    titleAscii,
    heroVisualAscii,
    footerAscii,
  };
}
