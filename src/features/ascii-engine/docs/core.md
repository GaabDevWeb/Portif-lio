# Core

Re-export da implementação `ascii-interaction`.

## Responsabilidade
Expor engine, pipelines e tipos sem acoplar Next.js.

## Limites
Não inclui UI do shell nem tokens de tema.

## Dependências
`src/features/ascii-interaction/**`

## Extensibilidade
Novos módulos de produto importam daqui, não do path interno profundo.
