# Runbook: SPSE Procurement Sync

## Komponen

| Bagian | Lokasi |
|---|---|
| UI | `/procurement-sync` |
| API | `/api/procurement/spse/*` |
| FE feature | `src/features/procurement-sync` |

## Alur operator

### Session (disarankan: bookmarklet)

1. Di Arumanis `/procurement-sync`: **sekali saja** seret bookmarklet **Kirim Session → Arumanis** ke bookmark bar
2. Buka SPSE LPSE di tab browser yang sama, login + CAPTCHA
3. Klik bookmark → redirect ke Arumanis dengan `?spse_session=...` → session tersimpan otomatis (query dibersihkan)
4. **Sync paket** → staging terisi

Cadangan manual: DevTools → Cookies → salin **Value** `SPSE_SESSION` → tempel di UI (template `SPSE_SESSION=`).

### Setelah session aktif

5. Match otomatis / map manual ke pekerjaan
6. **Apply** → isi `kode_paket` ke kontrak yang cocok
7. **Promote Draft** → buat pekerjaan+kontrak draft untuk unmatched
8. Opsional: import dokumen paket ke berkas pekerjaan

## Env (APIAMIS)

```env
SPSE_BASE_URL=https://spse.inaproc.id
SPSE_LPSE_SLUG=cianjurkab
# PPK metadata untuk push kontrak (jika dipakai)
SPSE_PPK_NAMA=...
SPSE_PPK_NIP=...
```

## Endpoint penting

| Method | Path | Fungsi |
|---|---|---|
| GET | `…/status` | Session aktif? |
| POST | `…/session` | Simpan cookie |
| POST | `…/sync` | Tarik daftar paket |
| GET | `…/staging` | List staging |
| POST | `…/staging/apply` | Apply match → kontrak |
| POST | `…/staging/map` | Map manual pekerjaan |
| POST | `…/staging/promote-draft` | Buat draft dari staging |
| POST | `…/packages/import-documents` | Import berkas |
| POST | `…/kontrak/push` | Push ke SPSE (jika diaktifkan) |

## Troubleshooting

| Gejala | Cek |
|---|---|
| Bookmarklet “bukan SPSE” | Klik bookmark **di tab** `spse.inaproc.id`, bukan di Arumanis |
| SPSE_SESSION tidak ditemukan | Belum login / CAPTCHA; refresh SPSE lalu coba lagi |
| Redirect tapi gagal simpan | Pastikan sudah login Arumanis; coba cadangan paste manual |
| 401 session | Cookie kedaluwarsa; login ulang SPSE + bookmark lagi |
| Staging kosong | Sync gagal / filter tahun anggaran |
| Unmatched banyak | Nama paket beda; map manual atau promote draft |
| Import dokumen gagal | Session + URL dokumen masih valid |

## Catatan

- Session SPSE bersifat **user-bound** dan sementara
- Promote draft default `is_konsultan=true` (tanpa desa/kec) — lengkapi data di UI pekerjaan setelahnya
