# Gallery

## Responsibility

Catálogo de artes ASCII (browse/filtro/favoritos) com ações copy / edit / remix / export — domínio backend-ready, zero rede.

## Flow

`GalleryRepository` → query/filter → UI `/gallery`. Favoritos: `localStorage` (`ascii-engine:gallery:favorites`). Edit → `/?gallery=&action=edit`. Remix → aplica recipe W2.

## Deps

`ascii-engine/gallery` (types, mock repo, preview); `src/studio/gallery/*`; recipes para remix

## Limits

`MockGalleryRepository` (13 itens) — sem API. Sem upload/auth.

## Extension

Trocar mock por repo HTTP mantendo `GalleryRepository`. Novas actions em `studio/gallery/actions.ts`.
