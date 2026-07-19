# Legacy — experimental product surfaces

These modules were removed from the ASCII Engine product UI.

ASCII Engine is a **professional media → ASCII converter**, not an editor,
lab, playground, node graph, or scene compositor.

## Contained here

| Path | Former product tab |
|------|--------------------|
| `ControlPanel.tsx`, `LabViewport.tsx`, `ComparisonView.tsx`, `DebugOverlay.tsx`, `StressTest.tsx` | Engine |
| `playground/` | Playground |
| `stats/` | Stats |
| `panels/` | Studio (project / nodes / plugins) |
| `scene/` | Edit |

Do **not** re-export these into the main shell without a product decision
documented in `PRODUCT_DECISIONS.md`.

Kept for reference and possible extraction into a separate product.
