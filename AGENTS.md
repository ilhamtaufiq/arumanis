# AGENTS.md

Panduan onboarding untuk AI agent yang bekerja di repositori frontend **Arumanis**.

---

## Mulai Di Sini

Baca dokumen berikut **sebelum** mengubah kode:

| Urutan | Dokumen | Tujuan |
|---|---|---|
| 1 | [.agent/README.md](.agent/README.md) | Gambaran repo, stack, pola, checklist |
| 2 | [.agent/ARCHITECTURE.md](.agent/ARCHITECTURE.md) | Lapisan aplikasi dan alur request |
| 3 | [.agent/SYSTEM_OVERVIEW.md](.agent/SYSTEM_OVERVIEW.md) | Integrasi frontend ↔ APIAMIS |
| 4 | [.agent/rules.md](.agent/rules.md) | Konvensi implementasi |

---

## Backend Pasangan

Perubahan kontrak API, permission, atau relasi data memerlukan pembacaan backend terlebih dahulu:

```text
C:\laragon\www\apiamis
```

Jangan mengubah shape request/response di frontend tanpa memverifikasi controller, model, dan resource serializer di Laravel.

---

## Arsitektur Singkat

```text
React SPA  →  /bff/api  →  BFF (server/)  →  APIAMIS Laravel
```

- HTTP client: `src/lib/api-client.ts`
- BFF env: `APIAMIS_BASE_URL`
- Auth: session cookie httpOnly via BFF, bukan token di localStorage

---

## Workflow Tersedia

| Workflow | Kapan dipakai |
|---|---|
| [full-stack-feature](.agent/workflows/full-stack-feature.md) | Fitur baru lintas frontend + backend |
| [create-feature-frontend](.agent/workflows/create-feature-frontend.md) | Fitur UI-only atau konsumsi API existing |
| [change-api-contract](.agent/workflows/change-api-contract.md) | Ubah request/response endpoint |
| [debug-endpoint](.agent/workflows/debug-endpoint.md) | Investigasi error API |
| [testing](.agent/workflows/testing.md) | Menulis dan menjalankan test |

---

## Prinsip Operasional

- Ikuti **kode aktual** lebih dulu, bukan asumsi dari dokumentasi lama.
- Hormati pola **feature-first** di `src/features/<domain>/`.
- Gunakan `@/lib/api-client` untuk semua HTTP — jangan buat wrapper fetch baru.
- Perubahan lintas repo: selesaikan kontrak backend dan frontend secara konsisten.
- Sebelum selesai: `bun run lint`, `bun run build`, dan test modul terkait.

---

## Verifikasi Minimum

```bash
bun run lint
bun run build
bun run test
```

Untuk perubahan UI pada route authenticated, cek manual di browser setelah build/dev server aktif.