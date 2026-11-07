# Arumanis Desktop (GPUI)

Kerangka versi desktop Arumanis memakai [GPUI](https://www.gpui.rs/), framework UI dari Zed. Aplikasi ini
berbicara langsung ke backend **apiamis** (Rust/Axum), tanpa lewat BFF web.

## Status

Ini baru kerangka:

- Jendela utama dengan sidebar.
- Login ke apiamis (`POST /api/auth/login`). Token diambil dari cookie `arumanis_session` lalu dikirim sebagai `Authorization: Bearer`.
- Daftar pekerjaan (`GET /api/pekerjaan`).

Belum ada: form login interaktif, modul lain (kontrak, foto, kanban, SIPD, buku kontrak, dll.), dan penyimpanan sesi.

## Menjalankan

Butuh Rust stable dan library sistem yang dipakai GPUI di Linux (misalnya `libxkbcommon`, `libxcb`, `libwayland`, `libvulkan`, `fontconfig`).

```bash
cd desktop
export ARUMANIS_API_URL=http://localhost:8000
export ARUMANIS_EMAIL=you@example.com
export ARUMANIS_PASSWORD='...'
cargo run
```

Lalu klik **Masuk**.

## Catatan teknis

- `gpui` diambil dari crates.io (versi 0.2.x).
- `vendor/xattr` adalah salinan xattr 0.2.3 dengan `libc::ENOATTR` diganti `libc::ENODATA`, karena di Linux konstanta
  `ENOATTR` tidak ada. Dipasang lewat `[patch.crates-io]`. Dibutuhkan oleh `gpui` → `zed-async-tar`.
- Build pertama lama, karena GPUI dan dependency-nya besar.
- Kredensial lewat environment hanya untuk kerangka. Versi berikutnya memakai form login dan penyimpanan token yang aman.
