# ROOT OS Portfolio

Interactive OS-themed portfolio — personal kernel space.

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
npm run dev -- --turbo
# Skip boot: http://localhost:3000?fastboot=1
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm test` | Vitest unit tests |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript |

## Content

All copy lives in `/content` — edit before deploy:

- `content/profile.json` — identity, links
- `content/site.json` — SEO, OG, site URL
- `content/projects/` — portfolio entries + READMEs
- `content/manifesto.md` — Editor.app content

## Environment

Copy `.env.example` → `.env.local`:

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
NEXT_PUBLIC_ANALYTICS_ENDPOINT=   # optional beacon URL
CONTACT_WEBHOOK_URL=             # optional form webhook
```

## Deploy (Vercel)

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Set `NEXT_PUBLIC_SITE_URL` to production URL
4. Deploy — `vercel.json` includes security headers

```bash
npx vercel --prod
```

## Architecture

See [`docs/architecture/ROOT-OS-MASTERPLAN.md`](docs/architecture/ROOT-OS-MASTERPLAN.md).

## License

Private — portfolio project.
