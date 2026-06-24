# Arumanis

**Aplikasi Satu Data Air Minum dan Sanitasi** — sistem manajemen data dan pengawasan infrastruktur bidang air minum dan sanitasi.

Arumanis adalah frontend web untuk mengelola siklus hidup pekerjaan infrastruktur: perencanaan, kontrak, dokumentasi lapangan, progress, peta, publikasi, hingga administrasi akses pengguna. Aplikasi ini berpasangan dengan API backend [**APIAMIS**](https://github.com/ilhamtaufiq/apiamis) (Laravel).

| | |
|---|---|
| **Versi** | 0.4.0 |
| **Branch aktif** | `dev` |
| **Package manager** | [Bun](https://bun.sh/) |
| **Backend** | [apiamis](https://github.com/ilhamtaufiq/apiamis) |

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
- [Deployment](#deployment)
- [Lisensi](#lisensi)

---

## Gambaran Umum

Arumanis dirancang sebagai platform operasional terpadu untuk tim teknis dan pengawas lapangan. Data dikelola secara terpusat melalui API, sementara antarmuka menyediakan alur kerja yang sesuai peran pengguna (RBAC).

**Cakupan domain utama:**

- Manajemen kegiatan, pekerjaan, kontrak, output, dan penerima manfaat
- Dokumentasi berkas dan foto lapangan dengan validasi lokasi
- Pemantauan progress, peta proyek, dan analisis RAB
- Penugasan pengawas lapangan ke pekerjaan
- Publikasi konten, tiket dukungan, notifikasi, dan audit log

---

## Fitur Utama

### Manajemen Proyek
- Katalog pekerjaan dengan filter tahun anggaran, lokasi, dan status
- Kontrak, penyedia, RKA, dan master fase pekerjaan
- Output dan penerima manfaat terhubung ke pekerjaan

### Dokumentasi & Media
- Viewer dokumen multi-format (PDF, Word, Excel, gambar) di browser
- Upload dan pengelolaan berkas proyek
- Dokumentasi foto lapangan dengan geo-fencing dan watermark otomatis (tanggal, waktu, koordinat GPS)

### Pengawasan & Progress
- Penugasan pengawas lapangan ke pekerjaan (`user-pekerjaan`)
- Dashboard progress dan peta interaktif (heatmap, marker lokasi)
- Modul pengawasan terpisah (`/pengawasan`)

### Analisis & Laporan
- RAB Analyzer — ekstraksi dan analisis item pekerjaan dari dokumen
- Statistik pemakaian storage dan database
- Ekspor laporan (PDF, Excel)

### Administrasi & Keamanan
- Autentikasi Laravel Sanctum dan Google OAuth
- Role-based access control (RBAC) dengan CASL di UI
- Manajemen pengguna, role, permission, dan route permission
- Audit log dan error log

### Integrasi & Komunikasi
- Notifikasi in-app
- Integrasi WhatsApp bridge
- Publikasi/blog dan halaman publik

---

## Arsitektur

```text
┌─────────────────┐         HTTPS / REST          ┌─────────────────┐
│   Arumanis      │  ────────────────────────────▶  │    APIAMIS      │
│  (React + Vite) │  ◀────────────────────────────  │   (Laravel)     │
└─────────────────┘         JSON + Sanctum          └────────┬────────┘
                                                               │
                                                               ▼
                                                      ┌─────────────────┐
                                                      │  MySQL · Redis  │
                                                      │  File storage   │
                                                      └─────────────────┘
```

**Alur data:**

```text
User action → TanStack Router → Feature component → Feature API module
           → api-client.ts → Laravel API → Controller / Model
           → API Resource → Response → TanStack Query cache → UI
```

Frontend mengatur tampilan dan pengalaman pengguna; otorisasi dan persistensi data menjadi tanggung jawab backend.

---

## Tech Stack

| Kategori | Teknologi |
|---|---|
| UI | React 19, TypeScript |
| Build | Vite 6, Bun |
| Routing | TanStack Router (file-based) |
| Server state | TanStack Query |
| Client state | Zustand |
| Styling | Tailwind CSS 4, Radix UI, shadcn/ui |
| Form | React Hook Form, Zod |
| Authorization | CASL |
| HTTP | Native `fetch` (`src/lib/api-client.ts`) |
| Peta | Leaflet, react-leaflet |
| Grafik | Recharts |
| Testing | Vitest, Testing Library |

---

## Persiapan Lingkungan

| Kebutuhan | Versi |
|---|---|
| [Bun](https://bun.sh/) | Terbaru (disarankan) |
| Node.js | 18+ (alternatif) |
| Backend APIAMIS | Berjalan dan dapat diakses |
| Git | 2.x |

**Layout repositori lokal (disarankan):**

```text
C:\laragon\www\
  bun\       # frontend — repo ini
  apiamis\   # backend — repo terpisah
```

---

## Instalasi & Pengembangan

```bash
# Clone repository
git clone https://github.com/ilhamtaufiq/arumanis.git
cd arumanis

# Install dependensi
bun install

# Salin konfigurasi environment
cp .env.example .env

# Jalankan development server
bun run dev
```

Aplikasi tersedia di **http://localhost:5173** (port default Vite).

Pastikan backend APIAMIS sudah berjalan dan `VITE_API_BASE_URL` mengarah ke endpoint API yang benar.

---

## Konfigurasi

Buat file `.env` di root proyek:

```env
# URL API backend (wajib)
VITE_API_BASE_URL=https://apiamis.cianjur.space/api

# Base URL aplikasi pengawasan (opsional)
VITE_PENGAWAS_APP_BASE_URL=/pengawasan

# API key OpenRouter untuk fitur AI (opsional)
VITE_OPENROUTER_API_KEY=
```

| Variabel | Deskripsi |
|---|---|
| `VITE_API_BASE_URL` | Base URL REST API backend. Fallback bawaan: `https://apiamis.test/api` |
| `VITE_PENGAWAS_APP_BASE_URL` | Path aplikasi pengawasan terintegrasi |
| `VITE_OPENROUTER_API_KEY` | Kunci API untuk fitur yang memakai OpenRouter |

> **Catatan:** Variabel environment di-build ke bundle saat `bun run build`. Ubah nilai di `.env` lalu build ulang untuk deployment production.

---

## Struktur Proyek

```text
src/
├── components/          # Komponen UI bersama (layout, ui, shared)
├── config/              # Konfigurasi aplikasi (ability, tema)
├── features/            # Modul domain (feature-first)
│   ├── pekerjaan/       # Manajemen pekerjaan
│   ├── kontrak/         # Kontrak & penyedia
│   ├── berkas/          # Dokumen proyek
│   ├── foto/            # Foto lapangan
│   ├── progress/        # Progress pekerjaan
│   ├── user-pekerjaan/  # Penugasan pengawas
│   ├── map/             # Peta proyek
│   └── ...              # Modul domain lainnya
├── hooks/               # Custom React hooks
├── lib/                 # Utilitas (api-client, helpers)
├── routes/              # Definisi route TanStack Router
└── stores/              # State global Zustand
```

**Konvensi pengembangan:**

- API call per domain → `src/features/<feature>/api/`
- Komponen UI domain → `src/features/<feature>/components/`
- Semua request HTTP → `@/lib/api-client`
- State server → TanStack Query; state UI lintas komponen → Zustand

---

## Skrip Tersedia

| Perintah | Fungsi |
|---|---|
| `bun run dev` | Development server dengan HMR |
| `bun run build` | Build production |
| `bun run preview` | Preview build production secara lokal |
| `bun run lint` | Lint kode dengan ESLint |
| `bun run test` | Jalankan unit test (Vitest) |
| `bun run test:coverage` | Test dengan laporan coverage |
| `bun run whatsapp:bridge` | Jalankan WhatsApp bridge lokal |

---

## Deployment

### Docker (frontend saja)

```bash
docker build -t arumanis-frontend .
docker run -d -p 80:80 arumanis-frontend
```

### Docker Compose (full stack)

Jalankan dari root repo frontend. Backend di-resolve dari folder saudara `../apiamis`:

```bash
docker compose up -d --build
```

| Service | URL default |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000/api |
| MySQL | localhost:3307 |

Migrasi database setelah container aktif:

```bash
docker compose --profile tools run --rm migrate
```

Override port dan kredensial melalui `.env`:

```env
FRONTEND_PORT=3000
BACKEND_PORT=8000
MYSQL_PORT=3307
MYSQL_DATABASE=apiamis
MYSQL_USER=apiamis
MYSQL_PASSWORD=apiamis
MYSQL_ROOT_PASSWORD=root
VITE_API_BASE_URL=http://localhost:8000/api
FRONTEND_URL=http://localhost:3000
APIAMIS_APP_URL=http://localhost:8000
```

### Production (Coolify)

Proyek dikonfigurasi untuk auto-deploy melalui webhook GitHub ke [paas.cianjur.space](https://paas.cianjur.space). Push ke branch deployment yang terhubung akan memicu build ulang container.

---

## Repositori Terkait

| Repo | Peran |
|---|---|
| [arumanis](https://github.com/ilhamtaufiq/arumanis) | Frontend React (repo ini) |
| [apiamis](https://github.com/ilhamtaufiq/apiamis) | Backend Laravel REST API |
| [arumanis-pengawasan](https://github.com/ilhamtaufiq/arumanis-pengawasan) | Panel pengawas lapangan |

Perubahan yang menyentuh kontrak API harus dilakukan di kedua repositori secara konsisten.

---

## Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE).