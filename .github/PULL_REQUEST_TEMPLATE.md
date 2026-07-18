## Ringkasan

<!-- Apa yang diubah dan kenapa (2–5 kalimat). -->

## Jenis perubahan

- [ ] `feat` — fitur baru
- [ ] `fix` — perbaikan bug
- [ ] `docs` — dokumentasi saja
- [ ] `refactor` / `perf` / `chore` / `ci` / `build`
- [ ] Breaking change (jelaskan di bawah)

## Scope

<!-- Modul / area: pekerjaan, kontrak, BFF, docker, docs-site, … -->

-

## Checklist

- [ ] Branch dari `dev` (kecuali hotfix ke `main`)
- [ ] `bun run lint` lulus
- [ ] `bun run build` lulus (atau `build:spa` + `docs:build` jika relevan)
- [ ] Smoke / cek manual route yang disentuh
- [ ] Kontrak API dicek di **apiamis** jika request/response berubah
- [ ] Panel **pengawas** disesuaikan jika endpoint pengawas berubah
- [ ] Tidak ada secret / `.env` di diff
- [ ] Commit message mengikuti conventional commits

## Test plan

<!-- Langkah verifikasi reviewer / Coolify -->

1.
2.

## Screenshots / log

<!-- Opsional: UI, Coolify build, error sebelum/sesudah -->

## Deploy notes

- [ ] Perlu env baru di Coolify / BFF
- [ ] Perlu migrasi di apiamis
- [ ] Hanya frontend (auto-deploy Coolify dari `dev`)

## Merge

Setelah review:

1. Squash atau merge commit sesuai kesepakatan (default: **squash** ke `dev`)
2. Pastikan CI/manual checks hijau (bila Actions aktif)
3. Coolify akan build image dari branch target
