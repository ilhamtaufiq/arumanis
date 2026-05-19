# AGENTS.md

Panduan awal untuk AI agent yang bekerja di repo frontend **Arumanis**.

## Baca dulu

1. `.agent/README.md`
2. `.agent/ARCHITECTURE.md`
3. `.agent/SYSTEM_OVERVIEW.md`
4. `.agent/rules.md`

## Jika tugas menyentuh backend

Repo pasangan berada di:

```text
C:\laragon\www\apiamis
```

Untuk perubahan request/response, permission, atau relasi data, baca backend sebelum mengubah frontend.

## Workflow yang tersedia

- `.agent/workflows/full-stack-feature.md`
- `.agent/workflows/debug-endpoint.md`
- `.agent/workflows/change-api-contract.md`
- `.agent/workflows/create-feature-frontend.md`
- `.agent/workflows/testing.md`

## Prinsip singkat

- Ikuti kode aktual lebih dulu, bukan asumsi dari docs lama.
- Gunakan `src/lib/api-client.ts` untuk HTTP.
- Hormati pola feature-first di `src/features`.
- Untuk perubahan lintas repo, selesaikan kontrak backend dan frontend bersama-sama.

