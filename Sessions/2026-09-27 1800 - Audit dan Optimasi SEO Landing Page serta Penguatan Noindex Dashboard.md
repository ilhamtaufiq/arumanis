---
tags: [arumanis, session]
date: 2026-09-27
time: "18:00"
module: bun
status: done
agent: claude-code
files:
  - index.html
  - public/robots.txt
  - src/routes/capaian-spm.tsx
  - src/routes/privacy-policy.tsx
  - src/routes/publikasi/index.tsx
  - src/routes/terms.tsx
---

[[HQ-Dashboard|Kembali ke Dashboard]] · [[Arumanis - Log Pengembangan|Index Sesi]]

## Goal

Audit dan Optimasi SEO Landing Page serta Penguatan Proteksi Noindex pada Rute Dashboard & Internal.

## Constraints/Assumptions

- Rute publik landing page (`/`, `/capaian-spm`, `/publikasi`, `/terms`, `/privacy-policy`) ter-indexing dengan baik di mesin pencari.
- Seluruh rute dashboard dan area terotentikasi (`/dashboard`, `/settings`, `/users`, dll) tidak boleh di-index (noindex).

## Keputusan & Perubahan

1. **Meta & Local SEO Enhancement**:
   - Menambahkan meta tag lokasi (`geo.region: ID-JB`, `geo.placename: Kabupaten Cianjur`, `geo.position`, `ICBM`) di `index.html`.
   - Menambahkan OpenGraph location metadata (`og:locale`, `og:site_name`, `og:locality`, `og:region`, `og:country-name`) di `index.html`.

2. **Perbaikan Favicon Links**:
   - Memperbaiki tautan favicon 404 (`/images/favicon*`) di `index.html` menjadi merujuk ke aset aktif `/arumanis.svg` & `/logo-arumanis.png` serta menambahkan `apple-touch-icon`.

3. **Penerapan Dynamic Page SEO pada Rute Publik**:
   - Memasang hook `usePageSeo` pada rute publik `/capaian-spm`, `/publikasi`, `/terms`, dan `/privacy-policy` untuk penanganan meta title, description, dan canonical URL secara dinamis.

4. **Penguatan Proteksi Noindex Rute Dashboard**:
   - Memastikan `AuthenticatedLayout` dan halaman `/sign-in` menyuntikkan `<meta name="robots" content="noindex, nofollow" />`.
   - Memperluas aturan `Disallow` di `public/robots.txt` mencakup rute internal & dashboard (`/dashboard`, `/settings`, `/users`, `/pekerjaan`, `/desa`, `/kanban`, `/gis-lab`, dll).

## Status (Done / Now / Next)

- **Done**: Audit SEO, perbaikan favicon, implementasi local SEO, dynamic page SEO rute publik, penguatan noindex rute dashboard, pembuatan sesi.
- **Now**: Commit dan push ke branch `dev`.
- **Next**: Verifikasi tampilan SERP & social share preview di environment staging/production.

## Working Set (File yang disentuh)

  - index.html
  - public/robots.txt
  - src/routes/capaian-spm.tsx
  - src/routes/privacy-policy.tsx
  - src/routes/publikasi/index.tsx
  - src/routes/terms.tsx
