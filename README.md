<div align="center">

<img src="public/arumanis.svg" alt="Arumanis" width="120" />

# Arumanis

### Satu data air minum & sanitasi · Kabupaten Cianjur

Portal operasional untuk perencanaan, pelaksanaan, dokumentasi lapangan, dan pengawasan program air minum & sanitasi. Frontend + BFF berpasangan dengan backend [**APIAMIS**](https://github.com/ilhamtaufiq/apiamis).

[![version](https://img.shields.io/badge/version-0.6.0-674bb5?style=for-the-badge&labelColor=111111)](package.json)
[![bun](https://img.shields.io/badge/runtime-Bun_1.2-f9f1e1?style=for-the-badge&labelColor=111111&logo=bun&logoColor=f9f1e1)](https://bun.sh/)
[![react](https://img.shields.io/badge/UI-React_19-61dafb?style=for-the-badge&labelColor=111111&logo=react&logoColor=61dafb)](https://react.dev/)
[![license](https://img.shields.io/badge/license-MIT-22c55e?style=for-the-badge&labelColor=111111)](LICENSE)

<p>
  <a href="https://arumanis.cianjur.space"><strong>Production</strong></a>
  ·
  <a href="https://arumanis.cianjur.space/docs"><strong>Docs</strong></a>
  ·
  <a href="https://arumanis.cianjur.space/changelog"><strong>Changelog</strong></a>
  ·
  <a href="AGENTS.md"><strong>AGENTS</strong></a>
</p>

| Branch | Runtime | Backend | Maintainer |
|:------:|:-------:|:-------:|:----------:|
| `dev` | Bun | [apiamis](https://github.com/ilhamtaufiq/apiamis) | [@ilhamtaufiq](https://github.com/ilhamtaufiq) |

</div>

---

## Apa ini?

Arumanis adalah SPA + BFF untuk staf dinas, operator, dan pengawas lapangan. Data bisnis hidup di Laravel APIAMIS; repo ini mengurus UI, session cookie, dan proxy aman ke API.

```text
  👤 Operator / Pengawas
           │
           ▼
  ┌────────────────────┐     /bff/*      ┌─────────────────┐     REST      ┌──────────────┐
  │  React SPA         │ ──────────────► │  BFF (Hono/Bun) │ ────────────► │  APIAMIS     │
  │  Vite · :5173      │ ◄────────────── │  server/ :8787  │ ◄──────────── │  Laravel     │
  └────────────────────┘  httpOnly cookie└─────────────────┘   Sanctum     └──────┬───────┘
                                                                                   │
                              Fumadocs → /docs                                     ▼
                                                                                 MySQL · Redis · storage
```

Token API **tidak** disimpan di `localStorage`. Auth lewat session cookie httpOnly dari BFF.

---

## Modul

| Area | Isi |
|------|-----|
| **Proyek** | Kegiatan, pekerjaan, kontrak, output, penerima, RKA, master fase |
| **Lapangan** | Foto progress 0–100%, geo-fence desa, watermark GPS, berkas, checklist |
| **Dokumen** | OnlyOffice di browser, unduhan ZIP, import SPSE, cache SIPD Renja |
| **Pengawasan** | Panel `/pengawasan` (SSO), penugasan, laporan, tiket |
| **Intel** | Dashboard, peta, PUSPEN, RAB analyzer, executive view |
| **Ops** | RBAC (CASL), audit log, backup, WhatsApp inbox, asisten AI |
| **Publik** | Publikasi, capaian SPM, panduan Fumadocs di `/docs` |

Stack ringkas: React 19 · TypeScript · Vite · TanStack Router/Query · Zustand · Tailwind 4 · Radix · Hono · Leaflet · Recharts.

---

## Mulai lokal

**Butuh:** [Bun](https://bun.sh/) · APIAMIS yang bisa di-hit · Git

```text
C:\laragon\www\
  bun\        ← repo ini (frontend + BFF)
  apiamis\    ← backend Laravel
```

```bash
git clone https://github.com/ilhamtaufiq/arumanis.git
cd arumanis
bun install
cp .env.example .env
# set APIAMIS_BASE_URL → API Laravel kamu

bun run dev
```

| Service | URL |
|---------|-----|
| SPA (Vite) | http://localhost:5173 |
| BFF | http://localhost:8787 |
| Health | http://localhost:8787/health/live |
| Docs (dev) | `bun run docs:dev` → Fumadocs |

Vite mem-proxy `/bff` ke BFF. Login butuh APIAMIS hidup.

Pisah proses:

```bash
bun run dev:client   # Vite saja
bun run dev:server   # BFF watch
```

---

## Konfigurasi

Salin `.env.example` → `.env`.

### Server (BFF)

| Variabel | Fungsi | Default tipikal |
|----------|--------|-----------------|
| `APIAMIS_BASE_URL` | Base REST Laravel (tanpa `/` akhir) | `http://apiamis.test/api` |
| `PORT` | Port BFF | `8787` |
| `SESSION_COOKIE_NAME` | Nama cookie | `arumanis_session` |
| `SESSION_COOKIE_SECURE` | Flag `Secure` | `false` di dev |

### Client (`VITE_*`, di-bake saat build)

| Variabel | Fungsi |
|----------|--------|
| `VITE_PENGAWAS_APP_BASE_URL` | Base panel pengawasan |
| `VITE_API_BASE_URL` | Override API (prod build) |
| `VITE_REVERB_*` | Realtime Echo/Reverb |
| `VITE_OPENROUTER_API_KEY` | Fitur AI (opsional) |
| `VITE_UMAMI_*` | Analytics (opsional) |

Ubah `VITE_*` → build ulang (`bun run build`).

---

## Peta repositori

```text
.
├── server/           BFF Hono: auth, proxy, static prod, /docs
├── docs-site/        Fumadocs (React Router) → dist/docs
├── scripts/          dev, health, docs:build, proposal/SOP generators
├── public/           aset SPA + logo
├── docs/             user-guide, runbook, artefak proposal
└── src/
    ├── features/     domain feature-first (pekerjaan, foto, kontrak, …)
    ├── routes/       TanStack Router
    ├── components/   UI bersama
    ├── lib/          api-client, geo, wilayah, auth helpers
    ├── stores/       Zustand
    └── config/       CASL ability, tema
```

| Concern | Tempat |
|---------|--------|
| HTTP ke backend | `@/lib/api-client` → `/bff/api/*` |
| API / UI / types per domain | `src/features/<domain>/` |
| Server state | TanStack Query |
| UI global | Zustand |
| Onboarding agent | [AGENTS.md](AGENTS.md) · [.agent/](.agent/) |

---

## Skrip

| Perintah | Apa yang terjadi |
|----------|------------------|
| `bun run dev` | Vite + BFF bareng |
| `bun run build` | SPA + Fumadocs → `dist/` (+ `dist/docs`) |
| `bun run start` | BFF production serve `dist/` |
| `bun run docs:dev` / `docs:build` | Situs panduan |
| `bun run lint` | ESLint |
| `bun run smoke` | Cek artefak post-build |
| `bun run audit:routes` | Audit route permission |
| `bun run version:release` | Bump platform lintas repo (lihat `platform.version.json`) |

Generator dokumen (proposal, SOP, kemanfaatan) ada di skrip `proposal:*` dan `docs:*` di `package.json`.

---

## Deploy

**Production lokal**

```bash
bun run build
bun run start
```

**Docker**

```bash
docker build -t arumanis-frontend .
docker run -d -p 80:80 \
  -e APIAMIS_BASE_URL=https://apiamis.example/api \
  arumanis-frontend
```

Builder memakai Bun 1.2.17 + Node untuk prerender docs. Context Docker harus memuat `docs-site/content/**` dan `docs/user-guide/**` (lihat `.dockerignore`).

**Coolify / PaaS**

Production di [paas.cianjur.space](https://paas.cianjur.space): webhook GitHub → image Docker → deploy. Set `APIAMIS_BASE_URL`, cookie secure, dan domain publik.

```text
git push origin dev  →  Coolify build  →  arumanis.cianjur.space
```

GitHub Actions CI saat ini **manual only** (`workflow_dispatch`) sampai billing akun GitHub dibuka lagi. CD tetap di Coolify.

---

## Platform (tiga repo)

| Repo | Peran | Versi platform |
|------|--------|----------------|
| [arumanis](https://github.com/ilhamtaufiq/arumanis) | Frontend + BFF (ini) | **0.6.0** |
| [apiamis](https://github.com/ilhamtaufiq/apiamis) | Laravel API | 0.6.0 |
| [arumanis-pengawasan](https://github.com/ilhamtaufiq/arumanis-pengawasan) | Panel lapangan | 0.6.0 |

Versi diselaraskan lewat `platform.version.json`. Ubah kontrak API di **kedua** sisi (apiamis + arumanis).

---

## Docs & referensi

| Link | Untuk |
|------|--------|
| [/docs](https://arumanis.cianjur.space/docs) | Panduan pengguna (Fumadocs) |
| [docs/user-guide/](docs/user-guide/) | Sumber Markdown modul |
| [docs/runbooks/](docs/runbooks/) | OnlyOffice, WhatsApp, SPSE |
| [AGENTS.md](AGENTS.md) | Agent / kontributor AI |
| [CHANGELOG.md](CHANGELOG.md) | Riwayat rilis |
| [LINEAGE.md](LINEAGE.md) | sandb → amspro → Arumanis |

---

## Kontribusi

Maintainer: [@ilhamtaufiq](https://github.com/ilhamtaufiq). Issue teknis lewat GitHub Issues.

1. Branch dari `dev`.
2. Domain baru → `src/features/<nama>/`, jangan tumpuk di `components/` global.
3. Semua HTTP lewat `@/lib/api-client`.
4. Cek: `bun run lint` · `bun run build` · smoke/audit bila relevan.
5. Kontrak API: selesaikan apiamis + frontend bareng.
6. Jangan taruh trailer `Co-authored-by` bot di commit.

---

## Lisensi

[MIT](LICENSE) · Copyright (c) ARUMANIS

<div align="center">

<br />

<img src="public/arumanis.svg" alt="" width="48" opacity="0.9" />

<sub>Air Minum &amp; Sanitasi · Kabupaten Cianjur</sub>

</div>
