# AI

## Responsibility

`AiProvider` injectável — default stub sem rede (App-injected real no futuro).

## Flow

`createAsciiEngine({ ai })` → provider methods (suggest/analyze stubs).

## Deps

`ascii-engine/ai`; opcionalmente stats/heatmap como input

## Limits

Sem chamadas HTTP. Sem API keys no Core. Stub só para contratos.

## Extension

Inject provider real na App; Core permanece agnóstico.
