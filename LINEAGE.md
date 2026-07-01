# Riwayat Asal Arumanis Platform

Dokumen ini menjelaskan evolusi produk dari pilot hingga platform operasional saat ini.

## Diagram evolusi

```text
sandb (pilot)  →  amspro (prototipe monolith)  →  arumanis + apiamis + pengawas (platform final)
```

| Era | Repositori | Arsitektur | Status |
|-----|------------|------------|--------|
| Pilot | [sandb](https://github.com/ilhamtaufiq/sandb) | Laravel monolith (fork cendeka/sandb) | Diarsipkan |
| Prototipe AMS | [amspro](https://github.com/ilhamtaufiq/amspro) | Laravel + Inertia/React monolith | Diarsipkan |
| Platform | [arumanis](https://github.com/ilhamtaufiq/arumanis) | SPA React + BFF | Aktif |
| Platform | [apiamis](https://github.com/ilhamtaufiq/apiamis) | Laravel API | Aktif |
| Platform | [pengawas](https://github.com/ilhamtaufiq/arumanis-pengawasan) | SPA pengawasan lapangan | Aktif |

## Warisan antar era

**Dari sandb:** fokus domain database sanitasi, pola data wilayah/desa.

**Dari amspro:** modul pekerjaan, kontrak, foto, progress, berkas, penerima, penyedia, RBAC.

**Ditulis ulang di platform final:** BFF + session cookie, ONLYOFFICE, Drive 3-zona, landing publik SPM, SSO pengawas, chat AI/RAG, Puspen hub.

## Versi platform

Versi operasional diselaraskan lintas tiga repo aktif. Lihat `platform.version.json` dan `CHANGELOG.md`.

| Versi | Tanggal | Catatan |
|-------|---------|---------|
| 0.4.0 | 2025-12-28 | Release terakhir era migrasi awal |
| 0.5.0 | 2026-07-01 | Drive 3-zona, user-drive, ONLYOFFICE kontrak, landing SEO |

## Changelog publik

Riwayat rilis untuk publik: `/changelog` pada situs Arumanis.