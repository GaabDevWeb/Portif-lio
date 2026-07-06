export const rootOsReadme = `# ROOT OS Portfolio

An interactive operating system built in the browser — not a metaphor, a working subsystem.

## Problem

Traditional portfolios show work. ROOT OS lets visitors **operate** it: boot sequence, terminal, GUI apps, easter eggs, shutdown.

## Architecture

| Layer | Tech | Purpose |
|-------|------|---------|
| Boot cinema | R3F + CRT shader | Cap. 0–1 narrative entry |
| Terminal | xterm.js + parser | Always-on CLI with VFS |
| Window Manager | GSAP + Zustand | Draggable apps, taskbar |
| Content | \`/content\` JSON/MD | Zero hardcoded copy |

## Highlights

- 56+ terminal commands with man pages and easter eggs
- Mobile layout with FAB toolbar and app drawer
- \`prefers-reduced-motion\` and coarse-pointer fast paths
- Session persistence (\`fastboot\`, history, chapter progress)

## Try it

\`\`\`bash
whoami → projects → git log → top → shutdown -h now
\`\`\`

## Stack

Next.js 15 · TypeScript · Tailwind v4 · GSAP · Motion · xterm.js · R3F · Zustand
`;

export const designSystemReadme = `# Engineering Design System

A token-first design system for teams that ship fast without shipping debt.

## Foundations

- **Color:** OKLCH tokens — phosphor green terminal palette + void backgrounds
- **Type:** IBM Plex Sans + IBM Plex Mono
- **Motion:** GSAP timelines with reduced-motion fallbacks
- **Components:** shadcn/ui primitives, composed not copied

## Deliverables

- \`MASTER.md\` design tokens reference
- Page-level overrides in \`design-system/pages/\`
- Contrast-checked phosphor-on-void pairs (≥4.5:1)

## Used in

ROOT OS portfolio shell, terminal chrome, window frames, and form patterns (Mail.app).

## Principles

1. One source of truth in tokens
2. Diegetic UI over decorative noise
3. Accessibility is not a phase — it's a constraint
`;

export const projectReadmes: Record<string, string> = {
  "root-os": rootOsReadme,
  "design-system": designSystemReadme,
};
