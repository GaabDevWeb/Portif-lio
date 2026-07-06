# Boot Cinema Subsystem — Phase 1

Cinematic boot sequence Cap. 0–2 per ROOT-OS-MASTERPLAN.

## Flow

```
BLACKOUT (2s) → BootCinema (R3F) → POST → LOGIN → SHELL
```

## Skip paths

| Trigger | Result |
|---------|--------|
| `?fastboot=1` | Direct SHELL |
| `localStorage fastboot` | Direct SHELL |
| `prefers-reduced-motion` | Text POST instant → LOGIN |
| `(pointer: coarse)` | Text POST instant → LOGIN |
| Esc (after 3s) | Skip to LOGIN |

## Components

| File | Role |
|------|------|
| `boot-experience.tsx` | Orchestrator |
| `boot-cinema.tsx` | R3F Canvas (lazy, SSR off) |
| `crt-scene.tsx` | Monitor + Sparkles + shader |
| `boot-post-sequence.tsx` | Module lines M-005/M-006 |
| `boot-login.tsx` | Cap. 2 guest login |
| `skip-hint.tsx` | Esc skip M-008 |

## Motion IDs

See `src/animations/motion-ids.ts` — M-001 through M-008.

## Teardown

WebGL Canvas unmounts when cinema completes (`showCinema = false`).

## Command

`fastboot on|off` — persists skip preference.
