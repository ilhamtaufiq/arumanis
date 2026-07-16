# Runbook: Backup ke Google Drive

Admin dapat menghubungkan akun Google sekali di **Pengaturan**, lalu mengunggah arsip backup (`.zip`) ke folder **Arumanis Backups** di Drive.

## Prasyarat Google Cloud

1. Project OAuth yang sama dengan login Google (`GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`).
2. Aktifkan **Google Drive API** di Google Cloud Console.
3. Tambah redirect URI authorized:
   ```text
   {APP_URL}/api/app-settings/backups/google-drive/callback
   ```
   Contoh lokal: `http://apiamis.test/api/app-settings/backups/google-drive/callback`
4. Di `apiamis/.env`:
   ```env
   GOOGLE_DRIVE_REDIRECT_URI="${APP_URL}/api/app-settings/backups/google-drive/callback"
   ```
5. Pastikan `FRONTEND_URL` mengarah ke SPA (redirect pasca-OAuth ke `/settings`).

## Alur pengguna

1. Login sebagai **admin** → **Pengaturan**.
2. Klik **Hubungkan Google Drive** → setujui scope `drive.file`.
3. Buat backup (jika belum ada) di panel Backup & Restore.
4. Klik ikon **cloud upload** pada baris backup → pantau progress.
5. File muncul di Drive folder **Arumanis Backups**.

## Endpoint (admin)

| Method | Path | Keterangan |
|---|---|---|
| GET | `/api/app-settings/backups/google-drive/status` | Status koneksi |
| GET | `/api/app-settings/backups/google-drive/connect` | URL OAuth |
| GET | `/api/app-settings/backups/google-drive/callback` | Callback Google (publik) |
| DELETE | `/api/app-settings/backups/google-drive` | Putus koneksi |
| POST | `/api/app-settings/backups/{filename}/google-drive` | Antre upload |
| GET | `/api/app-settings/backups/google-drive/jobs/{jobId}` | Progress upload |

## Keamanan

- Refresh token disimpan terenkripsi di `storage/app/google-drive/credentials.json` (bukan di `app_settings` publik).
- Scope `drive.file`: aplikasi hanya mengakses file/folder yang dibuatnya.
- Putus koneksi menghapus kredensial server; file di Drive tetap ada.

## Troubleshooting

| Gejala | Tindakan |
|---|---|
| "Google OAuth belum dikonfigurasi" | Isi `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` |
| redirect_uri_mismatch | Samakan `GOOGLE_DRIVE_REDIRECT_URI` dengan Console |
| Tidak ada refresh token | Cabut akses app di [Google Account permissions](https://myaccount.google.com/permissions), hubungkan ulang |
| Upload gagal mid-file | Cek log `storage/logs/gdrive-upload-*.log`; pastikan `exec`/`proc_open` diizinkan untuk job CLI |
| Folder tidak muncul | Scope/API belum aktif; coba putus + hubungkan ulang |

## Batasan fase 1

- Upload **manual** per arsip (belum auto setelah backup / belum cron harian).
- Restore tetap dari server lokal atau upload file ≤50 MB; unduh dari Drive dulu jika perlu restore arsip besar.
