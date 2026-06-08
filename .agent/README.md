# Frontend Agent Guide

Panduan ini adalah titik masuk cepat untuk AI agent yang bekerja di repo frontend **Arumanis**.

## 1. Peran repo ini

- Repo ini adalah frontend React untuk backend Laravel **APIAMIS** di `C:\laragon\www\apiamis`.
- Fokus utama aplikasi: manajemen pekerjaan/proyek, kontrak, dokumen, foto lapangan, progress, peta, publikasi, tiket, dan administrasi akses.
- Untuk aturan detail dan workflow operasional, baca juga:
  - `.agent/rules.md`
  - `.agent/FORM_STYLE_GUIDELINES.md`
  - `.agent/workflows/*`

## 2. Stack aktual

- React 19 + TypeScript
- Vite 6
- Bun sebagai package manager/runtime
- TanStack Router + TanStack Query
- Zustand
- Tailwind CSS v4 alpha + shadcn/ui/Radix UI
- React Hook Form + Zod
- CASL untuk authorization UI

## 3. Urutan baca sebelum mengubah kode

1. `package.json`
2. `src/lib/api-client.ts`
3. `src/routes/__root.tsx` dan `src/routes/_authenticated.tsx`
4. feature terkait di `src/features/<feature>/`
5. route terkait di `src/routes/`
6. `.agent/rules.md`

Kalau perubahan menyentuh data API, baca juga repo backend pasangan sebelum mengedit kontrak request/response.

## 4. Peta struktur penting

```text
src/
  components/        shared UI dan layout
  features/          modul domain utama
  lib/               utilitas, termasuk api-client
  routes/            file-based routes TanStack Router
  stores/            state global Zustand
  config/            ability, tema, konfigurasi aplikasi
```

Contoh fitur yang sering menjadi pusat integrasi:

- `pekerjaan`
- `kontrak`
- `berkas`
- `foto`
- `progress`
- `pengawas`
- `publikasi`
- `route-permissions`

## 5. Pola implementasi yang diharapkan

- Simpan API call per domain di `src/features/<feature>/api/`.
- Simpan UI domain di `src/features/<feature>/components/`.
- Gunakan `@/lib/api-client` untuk request HTTP, jangan membuat wrapper fetch baru tanpa alasan kuat.
- Ikuti pola route TanStack Router yang sudah ada, bukan menambah router kedua.
- Untuk form kompleks, gunakan React Hook Form + Zod.
- Untuk state server, pilih TanStack Query; untuk state UI lintas komponen, gunakan Zustand seperlunya.
- Saat menambah halaman authenticated, pertahankan pola layout `Header` + `Main` yang sudah dipakai project.

## 6. Kontrak dengan backend

- Base URL API di kode saat ini berasal dari `VITE_API_BASE_URL`, fallback ke `https://apiamis.test/api`.
- README lama menyebut `VITE_API_URL`; jangan mengasumsikan itu masih benar tanpa mengecek kode.
- Backend banyak mengembalikan Laravel API Resource; sebagian endpoint memakai wrapper collection bawaan Laravel, bukan selalu bentuk `{ data, meta }` manual.
- Bila mengubah endpoint, cek:
  - frontend `api/*.ts`
  - type di `types/`
  - resource/backend serializer yang relevan
  - loading, empty, dan error state UI

## 7. Hal yang mudah membuat regresi

- Authorization: ada kombinasi cookie auth, CASL ability, role, menu permission, dan route permission.
- Pekerjaan adalah domain sentral yang dipakai banyak fitur turunan.
- Fitur foto/dokumen menyentuh upload file dan backend storage.
- `vite.config.ts` mengandung aturan build dan alias yang sensitif terhadap environment; cek ulang saat mengubah konfigurasi.

## 8. Checklist sebelum selesai

- Jalankan minimal:
  - `bun run lint`
  - `bun run build`
- Jika perubahan menyentuh behavior fitur, jalankan test yang relevan dengan `bun run test`.
- Jika perubahan menyentuh API contract, verifikasi terhadap backend `apiamis`.
- Bila mengubah UI penting, cek manual route yang terdampak di browser.

## 9. Prinsip kerja agent

- Jangan mengubah banyak domain sekaligus bila masalahnya lokal.
- Jangan menebak kontrak API dari nama field saja; baca backend saat tersedia.
- Jangan menyalin pola dari docs lama bila implementasi aktual sudah berbeda.
- Jika menemukan mismatch antara dokumentasi dan kode, prioritaskan kode aktual lalu perbarui dokumentasi.
