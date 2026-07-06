# Engineering Design System

A token-first design system for teams that ship fast without shipping debt.

## Foundations

- **Color:** OKLCH tokens — phosphor green terminal palette + void backgrounds
- **Type:** IBM Plex Sans + IBM Plex Mono
- **Motion:** GSAP timelines with reduced-motion fallbacks
- **Components:** shadcn/ui primitives, composed not copied

## Deliverables

- `MASTER.md` design tokens reference
- Page-level overrides in `design-system/pages/`
- Contrast-checked phosphor-on-void pairs (≥4.5:1)

## Used in

ROOT OS portfolio shell, terminal chrome, window frames, and form patterns (Mail.app).

## Principles

1. One source of truth in tokens
2. Diegetic UI over decorative noise
3. Accessibility is not a phase — it's a constraint
