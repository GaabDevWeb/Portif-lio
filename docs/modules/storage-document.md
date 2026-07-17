# Storage & document

## Responsibility

`ProjectDocument` = SSOT de sessão; `ProjectStore` (IndexedDB) + `.ascii-project.zip` round-trip.

## Flow

create/load document → editor + meta/theme → `ProjectStore.save/load` (IDB) e/ou `downloadProjectZip` / `importProjectZip`.

## Deps

`ascii-engine/document`, `ascii-engine/storage`; editor embutido no document; browser `downloadBlob` para ZIP

## Limits

`EditorDocument` ≠ `ProjectDocument` (motor vs sessão). Sem sync cloud. IDB browser-only.

## Extension

Novos campos no document com versionamento de schema; backends de storage atrás de `ProjectStore`.
