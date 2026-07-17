# ASCII Engine Platform — Prompt de Implementação

> **Uso:** copiar este documento integralmente para um agente executor.  
> **SSOT obrigatório:** [ASCII-ENGINE-PLATFORM.md](./ASCII-ENGINE-PLATFORM.md)  
> **Baseline de código:** branch `ascii-engine-next`  
> **Branch de trabalho sugerida:** `ascii-engine-platform`

---

# PROMPT DE IMPLEMENTAÇÃO — ASCII Engine Platform

Tu és o agente EXECUTOR. A arquitetura já está decidida.
SSOT obrigatório: o documento "ASCII Engine Platform — Documento Arquitetural Definitivo (SSOT)"
produzido nesta sessão (gravar primeiro em docs/architecture/ASCII-ENGINE-PLATFORM.md).

## REGRAS ABSOLUTAS
1. NÃO inventar arquitetura nova. Seguir o SSOT.
2. NÃO remover funcionalidades V2.1 / ascii-engine Next.
3. NÃO alterar Hero nem rotas de produção do ROOT OS (exceto /labs/ascii).
4. NÃO mergear para main.
5. Trabalhar só numa branch dedicada criada a partir de `ascii-engine-next`
   (nome: `ascii-engine-platform` — evitar `feature/` se a ref `feature` existir).
6. Commits pequenos por fase. Relatório curto ao fim de cada fase em
   docs/architecture/phase-logs/PXX.md
7. Após cada fase: `npx tsc --noEmit` + eslint nos paths tocados + smoke manual/Puppeteer /labs/ascii
8. Preferir estender `src/features/ascii-engine/` e o shell `src/labs/ascii/`.
9. Manter `ascii-interaction` additive-only.
10. Exporters Blob-first; download só via browser adapter.

## BASELINE
- Branch atual de referência: ascii-engine-next
- Já existe: Image/GIF pipelines, workspace, exports ZIP/GIF, playground 4 efeitos,
  registries stubs, createAsciiEngine, themes, presets, stats, editor history stubs,
  animator frame ops.

## ORDEM DE FASES (obrigatória)
P0  Gravar SSOT PLATFORM.md + branch
P1  ProjectDocument + Storage + .ascii-project.zip import/export
P2  Editor tools (brush, eraser, fill, selection) + command-pattern history
P3  Perf: image worker path; patchSource quando cols/rows iguais; worker pool N
P4  Timeline keyframes + interpolação linear + onion skin UI
P5  Playground: implementar ≥4 stubs adicionais (fire, rain, wind, particles, …)
P6  NodeGraphRunner headless + nodes built-in (source→filters→charset→export)
P7  UI mínima do node editor na tab Studio (salvar no ProjectDocument)
P8  Um converter novo real (preferir SVG rasterizado OU webcam) + batch stub UI
P9  PluginHost + plugin exemplo (charset pack)
P10 CLI Node mínimo: convert, info, benchmark (package local ou scripts/)
P11 AI stubs (AiProvider) + heatmap stats; sem rede
P12 Revisão arquitetural, dedupe controls/download, docs API, relatório final,
    checklist SSOT §6 completo

## CRITÉRIOS DE ACEITAÇÃO GLOBAL
- tsc e eslint limpos
- Image→ASCII, GIF→ASCII, ZIP/GIF export, workspace, cursor, playground continuam a funcionar
- createAsciiEngine() expõe document, converters, nodes, plugins, ai
- Relatório final atualiza ASCII-ENGINE-EXTRACTION-REPORT.md

## PROIBIDO
- Reescrever pipelines do zero
- Segundo renderer paralelo ao EngineCore
- Dependências pesadas sem justificação no phase-log
- Simplificar removendo stubs/registries

Começa por P0. Não saltes fases. Não peças decisões arquiteturais — o SSOT é a autoridade.

---

## Referências

- SSOT: `docs/architecture/ASCII-ENGINE-PLATFORM.md`
- Baseline Next: `docs/architecture/ASCII-ENGINE-NEXT.md`
- Extração: `docs/architecture/ASCII-ENGINE-EXTRACTION-REPORT.md`
- Interaction runtime: `docs/architecture/ASCII-INTERACTION-ENGINE.md`
- GIF/V2: `docs/architecture/ASCII-ENGINE-V2.md`
