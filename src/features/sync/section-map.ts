import type { SectionId } from "@/types/root-os";

export const SECTION_IDS: SectionId[] = [
  "hero",
  "manifesto",
  "projects",
  "process",
  "knowledge",
  "timeline",
  "contact",
  "footer",
];

export const SECTION_LABELS: Record<SectionId, string> = {
  hero: "About",
  manifesto: "Manifesto",
  projects: "Projects",
  process: "Process",
  knowledge: "Graph",
  timeline: "Timeline",
  contact: "Contact",
  footer: "System",
};

export const SECTION_HASH: Record<SectionId, string> = {
  hero: "#hero",
  manifesto: "#manifesto",
  projects: "#projects",
  process: "#process",
  knowledge: "#knowledge",
  timeline: "#timeline",
  contact: "#contact",
  footer: "#footer",
};

/** Terminal echo when landing navigates to a section (if terminal is open). */
export const SECTION_TERMINAL_ECHO: Record<SectionId, string> = {
  hero: "$ cat about.md",
  manifesto: "$ cat manifesto.md",
  projects: "$ cd projects",
  process: "$ cat process.md",
  knowledge: "$ index --knowledge",
  timeline: "$ git log --oneline",
  contact: "$ mail --compose",
  footer: "$ uptime",
};

export function sectionFromHash(hash: string): SectionId | null {
  const normalized = hash.replace(/^#/, "").toLowerCase();
  if (normalized === "skills") return "knowledge";
  return SECTION_IDS.find((id) => id === normalized) ?? null;
}

export function sectionFromAlias(alias: string): SectionId | null {
  const map: Record<string, SectionId> = {
    hero: "hero",
    about: "hero",
    home: "hero",
    manifesto: "manifesto",
    projects: "projects",
    project: "projects",
    work: "projects",
    process: "process",
    knowledge: "knowledge",
    graph: "knowledge",
    skills: "knowledge",
    skill: "knowledge",
    timeline: "timeline",
    history: "timeline",
    git: "timeline",
    contact: "contact",
    mail: "contact",
    footer: "footer",
  };
  return map[alias.toLowerCase()] ?? null;
}
