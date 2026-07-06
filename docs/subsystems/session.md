# Session Store

Zustand store for ROOT OS session state.

## State

| Key | Description |
|-----|-------------|
| `phase` | Narrative phase (SHELL default in Phase 0) |
| `cwd` | Current working directory |
| `openApps` | Running GUI applications |
| `focusStack` | Z-order for windows |
| `flags.chaptersComplete` | Completed narrative chapters |

## Persistence

Partial persist via localStorage: `history`, `fastboot`, `flags`.

## Location

`src/providers/session-store.ts`
