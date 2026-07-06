# Window Manager — Phase 2

GUI layer per ROOT-OS-MASTERPLAN §17.

## Capabilities

- Open / close / focus / minimize / maximize / restore
- Z-index depth buffer (`maxZIndex + 1`)
- Drag via title bar (pointer events)
- Resize via bottom-right handle (4px brutalist)
- Alt+Tab focus cycle
- Taskbar restore for minimized windows

## Motion

| ID | Trigger | Implementation |
|----|---------|----------------|
| M-021 | Window open | `animateWindowOpen` GSAP scaleY |
| M-012 | Profile.app | `animateProfileReveal` |
| M-022 | Project select | Motion `layout` |
| M-025 | Contact submit | Motion `whileTap` |
| Terminal dock | App open | `animateTerminalDock` height shrink |

## Apps (Phase 2)

- `profile` — Profile.app
- `projects` — Projects.app master-detail
- `editor` — Editor.app manifesto split
- `mail` — Mail.app contact form (RHF + Zod)

## Commands

`open`, `close`, `whoami`, `cd projects`, `projects`, `cat manifesto.md`, `contact`
