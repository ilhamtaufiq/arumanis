# Runbook: SPSE Procurement Sync

## Komponen

| Bagian | Lokasi |
|---|---|
| UI | `/procurement-sync` |
| API | `/api/procurement/spse/*` |
| FE feature | `src/features/procurement-sync` |

## Alur operator

1. Buka SPSE LPSE di browser, login + CAPTCHA
2. Salin cookie header (`SPSE_SESSION`, dll.)
3. Tempel di UI → **Simpan session**
4. **Sync paket** → staging terisi
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
| 401 session | Cookie kedaluwarsa; login ulang SPSE |
| Staging kosong | Sync gagal / filter tahun anggaran |
| Unmatched banyak | Nama paket beda; map manual atau promote draft |
| Import dokumen gagal | Session + URL dokumen masih valid |

## Catatan

- Session SPSE bersifat **user-bound** dan sementara
- Promote draft default `is_konsultan=true` (tanpa desa/kec) — lengkapi data di UI pekerjaan setelahnya
