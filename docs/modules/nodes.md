# Nodes

## Responsibility

Node graph headless (`NodeGraphRunner`) + UI mínima Studio (`NodeGraphPanel`).

## Flow

Graph validate → runner executa nodes built-in → buffers matrix/animation.

## Deps

`ascii-engine/nodes` (16 nodes built-in); Studio panel form-based (não canvas)

## Limits

UI = forms, não node editor canvas. Sem live preview rico no graph.

## Extension

Novo node em `builtin-nodes`; UI canvas = fase futura sem mudar runner.
