import type { AsciiInteractionConfig } from "@/features/ascii-interaction/types";

export type ArchitecturePanelType =
  | "architecture"
  | "pipeline"
  | "flow"
  | "stack"
  | "problem"
  | "decision"
  | "performance"
  | "custom";

export interface ProjectQuickFact {
  label: string;
  value: string;
}

export interface ProjectHeroDetail {
  subtitle: string;
  quickFacts: ProjectQuickFact[];
  /** Bloco ASCII no lugar do título (zona de descrição). */
  titleAsciiKey: string;
  /** @deprecated use titleAsciiKey */
  asciiSourceKey?: string;
  /** Arte principal no canvas — vídeo em loop (preferido). */
  heroVideo?: string;
  /** @deprecated use heroVideo */
  heroGif?: string;
  /** Arte interativa no canvas quando não há GIF. */
  interactiveAsciiKey?: string;
  asciiConfig?: Partial<AsciiInteractionConfig>;
}

export interface ArchitecturePanel {
  id: string;
  type: ArchitecturePanelType;
  title: string;
  body: string;
  code?: string;
  order: number;
}

export interface ProjectFooterDetail {
  asciiSourceKey: string;
  links?: { label: string; href: string }[];
}

export interface ProjectDetail {
  slug: string;
  hero: ProjectHeroDetail;
  architecture: {
    panels: ArchitecturePanel[];
  };
  footer: ProjectFooterDetail;
}

export interface ProjectPageData {
  meta: import("@/types/root-os").ProjectMeta;
  detail: ProjectDetail;
  /** Título ASCII — zona de descrição */
  titleAscii: string;
  /** Arte interativa — zona visual (omitido quando só há GIF) */
  heroVisualAscii?: string;
  footerAscii: string;
}
