# ASCII Engine — Relatório de Extração

**Branch:** `ascii-engine-next`  
**Data:** 2026-07-09  
**Baseline:** V2.1 lab + pipelines

## Decisões

1. Fachada `src/features/ascii-engine/` em vez de mover `ascii-interaction` (zero breakage).
2. Branch dedicada `ascii-engine-next` (nome `feature/...` bloqueado por ref `feature` existente).
3. Rota permanece `/labs/ascii` para não afetar ROOT OS.
4. Identidade UI: ASCII Engine (tabs Convert/Animate/Playground/Engine/Stats/Studio).
5. Themes via CSS variables mapeadas aos tokens existentes do lab.
6. Playground usa `emitField` — sem segundo renderer.
7. Image conversion: yield cancelável; worker RGBA continua no path GIF.
8. GIF worker: `postMessage` com transferables quando possível; remount por `key` removido.

## Melhorias implementadas

- Namespace produto + `createAsciiEngine`
- Converter/Exporter/Importer registries (+ stubs)
- EditorDocument + history + tool catalog
- Animator frame ops + keyframe types
- Playground (4 efeitos ready + stubs)
- Presets session store + themes (10 packs)
- Stats panel + benchmark suite
- CLI command stubs + docs por módulo
- UI controls partilhados (`labs/ascii/ui/controls.tsx`)
- `reducedMotion` prop no React wrapper

## Pendentes (próximas iterações)

- Worker dedicado Image (OffscreenCanvas / ImageBitmap)
- Pool multi-worker real
- Tools de edição que mutam células
- Interpolação de keyframes
- Video/webcam/PDF implementações
- Package npm + bin CLI
- Extrair `@ascii-engine/core` para repo próprio

## Recomendações open-source

1. Publicar monorepo `packages/core|react|browser|cli`
2. Remover aliases `@/` → imports relativos no package
3. Injetar `reducedMotion` sempre por prop
4. Exporters só retornam `Blob`; CLI escreve FS
5. Manter formato `animation.ascii.zip` como interop estável
6. Licença MIT/Apache + fixtures de benchmark públicos
7. Visual regression em `/labs/ascii` como app de referência

## Revisão arquitetural

| Achado | Ação |
|--------|------|
| Controles UI duplicados | Extraídos para `ui/controls.tsx` (migração gradual dos painéis) |
| Download DOM espalhado | Centralizado em `ascii-engine/browser` |
| Storage IndexedDB morto | Mantido no interaction; wiring futuro via browser adapter |
| Previews legados | Mantidos mas não usados pelo shell (Workspace é o path) |
| Acoplamento Next na surface | Fora do SDK; Hero continua no app |

*Não mergear para main até review do produto.*
