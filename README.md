# Arumanis

[![Version](https://img.shields.io/badge/version-0.4.0-blue)](package.json)
[![Runtime](https://img.shields.io/badge/runtime-Bun-f9f1e1)](https://bun.sh/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

**Aplikasi Satu Data Air Minum dan Sanitasi** — platform web untuk manajemen, pengawasan, dan dokumentasi infrastruktur air minum dan sanitasi.

Arumanis adalah frontend operasional yang berpasangan dengan API backend [**APIAMIS**](https://github.com/ilhamtaufiq/apiamis) (Laravel). Aplikasi ini mencakup manajemen pekerjaan, kontrak, dokumentasi lapangan, progress, peta, publikasi, administrasi akses, dan panel pengawasan terintegrasi.

| | |
|---|---|
| **Versi** | 0.4.0 |
| **Branch aktif** | `dev` |
| **Maintainer** | [@ilhamtaufiq](https://github.com/ilhamtaufiq) |
| **Runtime & package manager** | [Bun](https://bun.sh/) |
| **Backend** | [apiamis](https://github.com/ilhamtaufiq/apiamis) |
| **Changelog publik** | [/changelog](https://arumanis.cianjurkab.go.id/changelog) |

---

## Daftar Isi

- [Gambaran Umum](#gambaran-umum)
- [Fitur Utama](#fitur-utama)
- [Arsitektur](#arsitektur)
- [Tech Stack](#tech-stack)
- [Persiapan Lingkungan](#persiapan-lingkungan)
- [Instalasi & Pengembangan](#instalasi--pengembangan)
- [Konfigurasi](#konfigurasi)
- [Struktur Proyek](#struktur-proyek)
- [Skrip Tersedia](#skrip-tersedia)
- [Testing & Kualitas](#testing--kualitas)
- [Deployment](#deployment)
- [Dokumentasi Terkait](#dokumentasi-terkait)
- [Kontribusi](#kontribusi)
- [Lisensi](#lisensi)

---

## Gambaran Umum

Arumanis dirancang sebagai sistem operasional terpadu untuk tim kantor, teknis lapangan, dan pengawas. Data bisnis disimpan dan divalidasi di backend; frontend menyediakan alur kerja berbasis peran (RBAC) dan pengalaman pengguna yang konsisten.

**Domain utama:**

- Kegiatan, pekerjaan, kontrak, output, dan penerima manfaat
- Berkas dan foto lapangan dengan validasi koordinat (geo-fencing)
- Progress fisik/keuangan, peta proyek, analisis RAB, dan modul PUSPEN
- Penugasan pengawas (`user-pekerjaan`) dan panel pengawasan terpisah
- Publikasi, notifikasi, tiket, audit log, dan administrasi akses

---

## Fitur Utama

### Manajemen Proyek

- Katalog pekerjaan dengan filter tahun anggaran, lokasi, tag, dan status
- Kontrak, penyedia, RKA, master fase, dan register penomoran dokumen
- Output komponen dan penerima manfaat terhubung ke pekerjaan

### Dokumentasi & Media

- Viewer dokumen multi-format (PDF, Office, gambar) di browser
- Upload berkas proyek dan dokumentasi foto dengan slot progress 0%–100%
- Geo-fencing koordinat terhadap batas desa pekerjaan
- Watermark otomatis (tanggal, waktu, koordinat) pada foto lapangan

### Pengawasan & Analisis

- Panel pengawasan (`/pengawasan`) dengan SSO dari aplikasi utama
- Dashboard progress, peta interaktif (marker, heatmap), dan modul PUSPEN review
- RAB Analyzer, statistik storage, dan ekspor laporan (PDF, Excel)

### Administrasi & Keamanan

- Autentikasi Laravel Sanctum melalui BFF (session cookie httpOnly)
- RBAC: role, permission, menu permission, route permission (CASL di UI)
- Audit log, error log, impersonate, dan pengaturan aplikasi

### Integrasi

- Notifikasi in-app dan broadcast
- WhatsApp bridge, Ami AI, dan halaman publik/SPM

---

## Arsitektur

```text
┌──────────────────┐     /bff/*      ┌──────────────────┐     REST      ┌──────────────────┐
│  React SPA       │ ──────────────▶ │  BFF (Hono/Bun)  │ ────────────▶ │  APIAMIS         │
│  Vite · :5173    │ ◀────────────── │  server/ · :8787 │ ◀──────────── │  Laravel         │
└──────────────────┘   session cookie └──────────────────┘   Sanctum     └────────┬─────────┘
                                                                                    │
                                                                                    ▼
                                                                           ┌──────────────────┐
                                                                           │ MySQL · Redis    │
                                                                           │ File storage     │
                                                                           └──────────────────┘
```

**Alur request:**

```text
User action
  → TanStack Router (src/routes)
  → Feature component (src/features/<domain>/components)
  → Feature API module (src/features/<domain>/api)
  → api-client.ts  →  POST/GET /bff/api/...
  → BFF server (server/index.ts)  →  APIAMIS Laravel
  → TanStack Query cache  →  UI
```

**Prinsip pemisahan tanggung jawab:**

| Lapisan | Tanggung jawab |
|---|---|
| React SPA | UI, routing client, state browser |
| BFF | Session auth, proxy API, cookie httpOnly |
| APIAMIS | Validasi bisnis, otorisasi final, persistensi |

Frontend tidak menjadi sumber kebenaran akses data — semua keputusan otorisasi dan validasi final berada di backend.

---

## Tech Stack

| Kategori | Teknologi |
|---|---|
| UI | React 19, TypeScript |
| Build | Vite 6, Bun |
| BFF | Hono (Bun runtime) |
| Routing | TanStack Router (file-based) |
| Server state | TanStack Query |
| Client state | Zustand |
| Styling | Tailwind CSS 4, Radix UI, shadcn/ui |
| Form | React Hook Form, Zod |
| Authorization (UI) | CASL |
| HTTP client | Native `fetch` (`src/lib/api-client.ts` → `/bff/api`) |
| Peta | Leaflet, react-leaflet |
| Grafik | Recharts |
| Testing | Vitest, Testing Library |

---

## Persiapan Lingkungan

| Kebutuhan | Versi / catatan |
|---|---|
| [Bun](https://bun.sh/) | Terbaru (wajib untuk dev & production server) |
| Backend APIAMIS | Berjalan dan dapat diakses dari mesin dev |
| Git | 2.x |

**Layout repositori lokal (disarankan):**

```text
C:\laragon\www\
  bun\       # frontend + BFF — repo ini
  apiamis\   # backend Laravel — repo terpisah
```

---

## Instalasi & Pengembangan

```bash
# Clone
git clone https://github.com/ilhamtaufiq/arumanis.git
cd arumanis

# Dependensi
bun install

# Environment
cp .env.example .env
# Sesuaikan APIAMIS_BASE_URL ke endpoint Laravel lokal/production

# Development (Vite + BFF)
bun run dev
```

| Service | URL default |
|---|---|
| Frontend (Vite) | http://localhost:5173 |
| BFF | http://localhost:8787 |
| Health check BFF | http://localhost:8787/health/live |

`bun run dev` menjalankan Vite dan BFF secara bersamaan. Vite mem-proxy request `/bff` ke BFF server.

**Menjalankan komponen terpisah:**

```bash
bun run dev:client   # hanya Vite
bun run dev:server   # hanya BFF (watch mode)
```

Pastikan backend APIAMIS aktif sebelum login atau memuat data.

---

## Konfigurasi

Salin `.env.example` ke `.env` dan sesuaikan nilai berikut.

### BFF & sesi (server)

| Variabel | Deskripsi | Default |
|---|---|---|
| `APIAMIS_BASE_URL` | Base URL REST API Laravel (tanpa trailing slash) | `http://apiamis.test/api` |
| `PORT` | Port BFF server | `8787` |
| `SESSION_COOKIE_NAME` | Nama cookie sesi | `arumanis_session` |
| `SESSION_COOKIE_SECURE` | Cookie `Secure` flag | `false` (dev) |
| `BUN_ENV` | Environment runtime | `development` |

### Client (Vite — di-build ke bundle)

| Variabel | Deskripsi |
|---|---|
| `VITE_PENGAWAS_APP_BASE_URL` | Base path panel pengawasan | `/pengawasan` |
| `VITE_GIPHY_API_KEY` | API key Giphy untuk picker media publikasi (opsional) |
| `VITE_OPENROUTER_API_KEY` | API key OpenRouter untuk fitur AI (opsional) |

> Variabel `VITE_*` di-resolve saat build. Untuk production, set nilai di environment build lalu jalankan `bun run build` ulang.

---

## Struktur Proyek

```text
.
├── server/                 # BFF Hono — auth proxy, session, static production
├── scripts/                # Dev orchestration, health, proposal generators
├── public/                 # Aset statis & docsify user guide
├── docs/                   # Panduan pengguna (sumber Markdown)
└── src/
    ├── components/         # UI bersama (layout, ui, shared)
    ├── config/             # Ability CASL, tema
    ├── features/           # Modul domain (feature-first)
    │   ├── pekerjaan/
    │   ├── puspen/
    │   ├── foto/
    │   └── ...
    ├── hooks/
    ├── lib/                # api-client, auth-utils, geo-utils, paginated-fetch
    ├── routes/             # TanStack Router (file-based)
    └── stores/             # Zustand global state
```

**Konvensi pengembangan:**

| Concern | Lokasi |
|---|---|
| HTTP ke backend | `@/lib/api-client` → `/bff/api/*` |
| API per domain | `src/features/<feature>/api/` |
| UI per domain | `src/features/<feature>/components/` |
| Types per domain | `src/features/<feature>/types/` |
| Server state | TanStack Query |
| State UI global | Zustand |

Panduan detail untuk kontributor dan AI agent: [AGENTS.md](AGENTS.md) dan [.agent/README.md](.agent/README.md).

---

## Skrip Tersedia

| Perintah | Fungsi |
|---|---|
| `bun run dev` | Vite + BFF development server |
| `bun run dev:client` | Hanya Vite |
| `bun run dev:server` | Hanya BFF (watch) |
| `bun run build` | Build production SPA |
| `bun run start` | Jalankan BFF production (serve `dist/`) |
| `bun run preview` | Preview build Vite |
| `bun run lint` | ESLint |
| `bun run test` | Vitest (watch) |
| `bun run test:coverage` | Vitest + coverage report |
| `bun run release` | Release-it (semver + changelog) |
| `bun run version:analyze` | Analisis commit lintas repo platform |
| `bun run version:changelog` | Regenerasi `CHANGELOG.md` dari git history |
| `bun run version:release` | Bump versi platform + tag (frontend & backend) |
| `bun run version:release:dry` | Simulasi rilis tanpa menulis file |

---

## Testing & Kualitas

```bash
# Unit & component tests
bun run test

# Coverage
bun run test:coverage

# Static analysis
bun run lint

# Verifikasi build production
bun run build
```

Sebelum merge, minimal jalankan `lint`, `build`, dan test pada modul yang diubah.

---

## Deployment

### Production (Bun + static)

```bash
bun run build
bun run start
```

BFF melayani `dist/` dan mem-proxy API ke `APIAMIS_BASE_URL`.

### Docker (frontend image)

```bash
docker build -t arumanis-frontend .
docker run -d -p 80:80 \
  -e APIAMIS_BASE_URL=https://api.example.com/api \
  arumanis-frontend
```

### Docker Compose (full stack)

Dari root repo frontend; backend di-resolve dari `../apiamis`:

```bash
docker compose up -d --build
```

| Service | URL default |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000/api |
| MySQL | localhost:3307 |

Migrasi database:

```bash
docker compose --profile tools run --rm migrate
```

### Coolify / PaaS

Proyek production di [paas.cianjur.space](https://paas.cianjur.space) menggunakan auto-deploy via webhook GitHub. Pastikan environment production memuat `APIAMIS_BASE_URL` dan variabel sesi yang sesuai domain.

---

## Dokumentasi Terkait

| Dokumen | Audiens |
|---|---|
| [public/docs/README.md](public/docs/README.md) | Pengguna akhir (help center) |
| [docs/user-guide/](docs/user-guide/) | Panduan modul per topik |
| [AGENTS.md](AGENTS.md) | AI agent & onboarding cepat |
| [.agent/ARCHITECTURE.md](.agent/ARCHITECTURE.md) | Catatan arsitektur frontend |
| [CHANGELOG.md](CHANGELOG.md) | Riwayat rilis |
| [LINEAGE.md](LINEAGE.md) | Evolusi platform sandb → amspro → Arumanis |

**Repositori terkait:**

| Repo | Peran |
|---|---|
| [arumanis](https://github.com/ilhamtaufiq/arumanis) | Frontend + BFF (repo ini) |
| [apiamis](https://github.com/ilhamtaufiq/apiamis) | Backend Laravel REST API |
| [arumanis-pengawasan](https://github.com/ilhamtaufiq/arumanis-pengawasan) | Panel pengawas lapangan (embedded) |

Perubahan kontrak API harus dilakukan konsisten di frontend dan backend.

---

## Kontribusi

Proyek ini dikelola dan dikembangkan oleh [@ilhamtaufiq](https://github.com/ilhamtaufiq). Issue dan diskusi teknis dipersilakan melalui GitHub Issues.

Jika Anda berkontribusi kode:

1. Fork repository dan buat branch dari `dev`.
2. Ikuti pola **feature-first** — jangan menaruh logika domain di `src/components/` global.
3. Gunakan `src/lib/api-client.ts` untuk semua request HTTP.
4. Jalankan `bun run lint`, `bun run build`, dan test terkait sebelum PR.
5. Untuk perubahan lintas repo, selesaikan kontrak backend (`apiamis`) dan frontend dalam satu kesatuan deploy.
6. Jangan sertakan trailer `Co-authored-by` bot/AI pada pesan commit — gunakan identitas GitHub maintainer saja.

Laporkan bug atau usulan fitur melalui issue GitHub dengan langkah reproduksi yang jelas.

---

## Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE).