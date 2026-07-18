# Arumanis Docs (Fumadocs)

Panduan pengguna Arumanis — digenerate dengan [Fumadocs](https://fumadocs.dev) (React Router SPA), di-host di path **`/docs`** pada aplikasi utama.

## Dev

```bash
# dari root monorepo
bun run docs:dev
# → http://localhost:5173/docs/  (port default Vite docs-site)
```

Pastikan `vite` docs-site memakai `base: '/docs/'` (sudah di-set).

## Build

```bash
# dari root monorepo (juga dipanggil oleh `bun run build`)
bun run docs:build
# → docs-site/build/client  →  dist/docs
```

BFF (`server/index.ts`) menyajikan `dist/docs` di path `/docs/*`.

## Konten

| Sumber | Keterangan |
|---|---|
| `docs-site/content/docs/*.mdx` | Halaman yang dirender |
| `docs/user-guide/*.md` | Sumber asli (boleh di-sync manual) |
| `content/docs/meta.json` | Sidebar / page tree |

## Branding

- Nama: `app/lib/shared.ts` → `appName`
- Warna aksen: `app/app.css` (`--color-fd-primary: #fb8500`)
