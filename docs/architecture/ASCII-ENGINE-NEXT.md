# ASCII Engine Next — Arquitetura de Produto (SSOT)

> **Baseline:** ASCII Engine V2.1 (Image/GIF pipelines, workspace, exports).  
> **Objetivo:** produto modular extraível do ROOT OS (`import { AsciiEngine }`).  
> **Branch:** `ascii-engine-next` (não mergear para `main` nesta fase).  
> **Roadmap de produto:** superseded by [`ASCII-ENGINE-PLATFORM.md`](./ASCII-ENGINE-PLATFORM.md) (SSOT Platform 3.0.0). Este documento permanece válido como baseline da fachada Next; decisões de plataforma, `ProjectDocument`, nodes, plugins e fases P0–P12 vivem no PLATFORM SSOT.  
> **Prompt do executor:** [`ASCII-ENGINE-PLATFORM-IMPLEMENTATION-PROMPT.md`](./ASCII-ENGINE-PLATFORM-IMPLEMENTATION-PROMPT.md).

---

## 1. Princípios

1. `ascii-interaction` permanece a **implementação**; `ascii-engine` é a **fachada estável**.
2. Não remover APIs existentes; só adicionar registries e adapters.
3. Blob-first nos exporters (download é adapter browser).
4. UI do produto vive em `/labs/ascii` (shell ASCII Engine); Hero ROOT OS intocado.

---

## 2. Layout

```
src/features/ascii-engine/
├── index.ts                 # SDK public surface
├── core/                    # re-exports ascii-interaction
├── browser/                 # download, clipboard
├── converters/              # SourceAdapter registry
├── editor/                  # document + history + tools
├── animator/                # timeline ops + keyframes
├── playground/              # interactive effects
├── presets/                 # versioned preset packs
├── themes/                  # design token themes
├── workspace/               # re-export lab workspace types/API
├── stats/                   # metrics panel helpers
├── benchmark/               # algorithm comparison
├── exporters/               # export registry
├── importers/               # import registry
├── sdk/                     # createAsciiEngine factory
├── cli/                     # command stubs
└── docs/                    # per-module docs
```

---

## 3. Shell UI tabs

`Convert | Animate | Playground | Engine | Stats`

Rota: `/labs/ascii` (estabilidade ROOT OS).

---

## 4. Extração futura

| Pacote | Conteúdo |
|--------|----------|
| `@ascii-engine/core` | engine + pipelines |
| `@ascii-engine/react` | canvas wrapper |
| `@ascii-engine/browser` | download/clipboard/IDB |
| app shell | themes UI, playground chrome |

---

*Versão: 3.0.0-next · SSOT produto ASCII Engine*
