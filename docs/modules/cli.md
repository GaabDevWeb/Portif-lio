# CLI

## Responsibility

CLI Node: `convert | info | benchmark` sobre o SDK (sem UI).

## Flow

`npm run ascii-engine -- <cmd>` → `cli/run` → FS I/O (`fs-io`) + converters/benchmark.

## Deps

`ascii-engine/cli`; SDK surface; Node FS (não browser download)

## Limits

PNG convert no CLI precisa canvas/sharp (ainda limitado). Sem GUI.

## Extension

Novos subcomandos em `commands.ts`; manter exporters Blob → writeFile no adapter FS.
