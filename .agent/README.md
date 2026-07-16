# Arumanis — Frontend Agent Guide

Dokumen ini adalah titik masuk untuk AI agent dan kontributor yang bekerja di repositori frontend **Arumanis**. Baca dokumen ini sebelum mengubah kode.

---

## Peran Repositori

| Aspek | Detail |
|---|---|
| **Repo** | `C:\laragon\www\bun` (GitHub: [arumanis](https://github.com/ilhamtaufiq/arumanis)) |
| **Backend pasangan** | `C:\laragon\www\apiamis` — Laravel REST API |
| **Fungsi** | React SPA + BFF (Hono/Bun) untuk manajemen pekerjaan, dokumentasi, progress, peta, dan administrasi |

Frontend mengatur UI dan pengalaman pengguna. Validasi bisnis, otorisasi final, dan persistensi data menjadi tanggung jawab backend.

---

## Dokumentasi Internal

Baca sesuai kebutuhan tugas, dalam urutan ini untuk onboarding:

| Prioritas | Dokumen | Isi |
|---|---|---|
| 1 | [rules.md](rules.md) | Konvensi kode, pola UI, aturan implementasi |
| 2 | [ARCHITECTURE.md](ARCHITECTURE.md) | Lapisan aplikasi, alur request, domain sentral |
| 3 | [SYSTEM_OVERVIEW.md](SYSTEM_OVERVIEW.md) | Hubungan frontend ↔ backend lintas repo |
| 4 | [FORM_STYLE_GUIDELINES.md](FORM_STYLE_GUIDELINES.md) | Standar form dan input |
| 5 | [API_FIELD_CONTRACT.md](API_FIELD_CONTRACT.md) | Mapping field DB ↔ API ↔ FE |
| 6 | [PERMISSIONS.md](PERMISSIONS.md) | Role, menuKey, endpoint sensitif |
| 7 | [DOMAIN_BOUNDARIES.md](DOMAIN_BOUNDARIES.md) | Batas domain, hot-spot, kapan tunda fitur |
| 8 | [workflows/](workflows/) | Prosedur fitur full-stack, debug API, testing |
| 9 | [../docs/runbooks/](../docs/runbooks/) | OnlyOffice, WhatsApp, SPSE |

Entry point ringkas di root repo: [AGENTS.md](../AGENTS.md).

---

## Stack & Runtime

| Komponen | Teknologi |
|---|---|
| UI | React 19, TypeScript, Vite 6 |
| BFF | Hono + Bun (`server/index.ts`, port 8787) |
| Routing | TanStack Router (file-based, `src/routes/`) |
| Server state | TanStack Query |
| Client state | Zustand |
| Styling | Tailwind CSS 4, Radix UI, shadcn/ui |
| Forms | React Hook Form + Zod |
| Auth UI | CASL (`src/config/ability`) |
| HTTP | `src/lib/api-client.ts` → prefix `/bff/api` |
| Package manager | **Bun** (jangan pakai npm/yarn untuk install) |

---

## Arsitektur Request

```text
Route (src/routes)
  → Feature component (src/features/<domain>/components)
  → Feature API (src/features/<domain>/api)
  → api-client.ts  (/bff/api/...)
  → BFF server (server/index.ts)
  → APIAMIS Laravel (APIAMIS_BASE_URL)
  → TanStack Query cache → UI
```

**Environment kritis:**

- `APIAMIS_BASE_URL` — target Laravel API untuk BFF (bukan `VITE_API_BASE_URL` di runtime client)
- `VITE_PENGAWAS_APP_BASE_URL` — path panel pengawasan (client build)

Jangan mengasumsikan kontrak API dari nama field saja; verifikasi controller dan resource di backend.

---

## Struktur Kode

```text
src/
  components/     # Shared UI, layout, shadcn primitives
  config/         # CASL ability, app config
  features/       # Domain modules (utama)
  hooks/          # Global hooks
  lib/            # api-client, auth-utils, geo-utils, paginated-fetch
  routes/         # TanStack Router pages
  stores/         # Zustand (auth, settings, dll.)
server/           # BFF — session, proxy, static serve
```

**Domain sentral:** `pekerjaan` — perubahan di sini sering berdampak ke `kontrak`, `berkas`, `foto`, `output`, `penerima`, `progress`, `pengawas`, `puspen`.

---

## Pola Implementasi

| Tugas | Pola |
|---|---|
| Endpoint baru | `features/<domain>/api/` + types + hook/query |
| Halaman baru | `routes/` + komponen di `features/<domain>/components/` |
| HTTP request | Selalu `@/lib/api-client` |
| Form kompleks | React Hook Form + Zod |
| List + pagination admin | `src/lib/paginated-fetch.ts` + `auth-utils.ts` |
| Guard admin route | `requireAdmin()` di route loader |

Jangan menambah router kedua, wrapper fetch paralel, atau logika domain besar di `src/components/` global.

---

## Perubahan Lintas Repo

Jika tugas menyentuh request/response, permission, atau relasi data:

1. Baca endpoint aktual di `apiamis` (`routes/api.php`, controller, resource)
2. Sesuaikan type dan `api/*.ts` di frontend
3. Update UI (loading, empty, error state)
4. Verifikasi dari kedua sisi sebelum selesai

Workflow terstruktur: [workflows/full-stack-feature.md](workflows/full-stack-feature.md), [workflows/change-api-contract.md](workflows/change-api-contract.md).

---

## Titik Rawan Regresi

- **Authorization:** cookie session + CASL + menu permission + route permission — UI boleh menyembunyikan tombol, backend tetap sumber kebenaran
- **Response shape:** tidak semua endpoint memakai `{ data, meta }`; cek Laravel JsonResource / collection
- **Upload media:** FormData via api-client; URL media dari backend
- **Pekerjaan scope:** filter role pengawas/pendamping di query backend
- **Geo-fencing foto:** `validasi_koordinat` disimpan saat upload; review di `features/puspen`

---

## Checklist Sebelum Selesai

```bash
bun run lint
bun run build
bun run test          # modul yang diubah
```

- [ ] Perilaku UI diverifikasi manual pada route terdampak
- [ ] Perubahan API diverifikasi terhadap backend `apiamis`
- [ ] Tidak ada kontrak env usang (`VITE_API_URL` dll.) tanpa cek kode aktual
- [ ] Dokumentasi diperbarui jika ada mismatch dengan implementasi

---

## Prinsip Kerja Agent

1. **Kode aktual > dokumentasi lama** — jika bertentangan, ikuti kode lalu perbarui docs
2. **Perubahan minimal** — jangan refactor lintas domain untuk bug lokal
3. **Feature-first** — modul baru dimulai dari `src/features/<nama>`
4. **Satu sumber HTTP** — `api-client.ts` untuk semua request
5. **Jangan tebak API** — baca backend sebelum mengubah kontrak