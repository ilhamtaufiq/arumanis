# Arumanis + APIAMIS System Overview

Dokumen ini menjelaskan hubungan dua repo yang membentuk satu sistem:

- Frontend: `C:\laragon\www\bun`
- Backend: `C:\laragon\www\apiamis`

## 1. Pembagian tanggung jawab

| Area | Frontend Arumanis | Backend APIAMIS |
| --- | --- | --- |
| UI dan interaksi | Ya | Tidak |
| Routing halaman | Ya | Tidak |
| State browser | Ya | Tidak |
| Validasi final | Sebagian | Ya |
| Authorization final | Sebagian untuk tampilan | Ya |
| Persistence | Tidak | Ya |
| Upload/media | UI upload dan preview | Penyimpanan, transformasi, download |

## 2. Alur request lintas sistem

```text
User action
  -> route frontend
  -> feature component
  -> feature api module
  -> src/lib/api-client.ts
  -> routes/api.php
  -> controller / model / service
  -> resource serializer
  -> response kembali ke frontend
  -> render ulang UI
```

## 3. Domain inti lintas repo

| Domain | Frontend | Backend |
| --- | --- | --- |
| Pekerjaan | `src/features/pekerjaan` | `PekerjaanController`, `Pekerjaan`, resources terkait |
| Kontrak | `src/features/kontrak` | `KontrakController`, `Kontrak` |
| Berkas | `src/features/berkas` | `BerkasController`, `Berkas` |
| Foto | `src/features/foto` | `FotoController`, `Foto` |
| Progress | `src/features/progress` | `ProgressController`, `Progress` |
| Publikasi/Blog | `src/features/publikasi` | `BlogController`, `Blog`, `BlogAsset` |

## 4. Aturan perubahan full-stack

Jika mengubah fitur yang menyentuh request/response:

1. mulai dari user flow yang ingin diperbaiki,
2. cek endpoint backend aktual,
3. cek resource/serializer,
4. ubah type dan api module frontend,
5. ubah UI,
6. verifikasi dari kedua sisi.

Jangan mulai dari UI lalu menebak shape API.

## 5. Authorization

- Frontend:
  - auth gate pada route
  - CASL / permission untuk pengalaman pengguna
- Backend:
  - Sanctum
  - role middleware
  - query scope dan aturan akses model

Frontend boleh menyembunyikan tombol, tetapi backend tetap sumber kebenaran akses.

## 6. Titik rawan integrasi

- pagination dan bentuk response collection
- upload file dan media URL
- field relasi yang hanya muncul jika di-eager-load
- caching PWA terhadap host API lokal
- role filtering pada data `pekerjaan`
- perubahan enum atau foreign key di migration backend

## 7. Definisi selesai untuk perubahan lintas repo

- backend route, validation, serialization, dan test masuk akal
- frontend type, api module, UI state, dan error handling sinkron
- akses user yang berbeda tidak rusak
- perubahan sudah dicoba dari happy path dan minimal satu edge case

