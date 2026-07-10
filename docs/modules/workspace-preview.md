# Workspace preview (never-crop)

## Responsibility

Viewport do Studio: mostrar a arte ASCII completa sem crop — só fit / zoom / pan.

## Flow

1. Engine `layoutMode="intrinsic"` → canvas = cols×cellW × rows×cellH  
2. `measureAsciiLayout` / content intrínseco no `WorkspaceCanvas`  
3. Fit (contain) **sem** cap em zoom 1; presets Fit / Fit W / Fit H / 100–800% / fullscreen  
4. Pan + zoom no workspace, nunca clip da arte

## Deps

`ascii-interaction` (`layout-size`, EngineCore); `studio/workspace/*`, `LabViewport`

## Limits

Regra de produto: **nunca cropar**. Fit ≠ cover. Testes em `workspace-fit.test.ts`.

## Extension

Novos modos de zoom no toolbar; manter medição intrínseca como fonte de verdade.
