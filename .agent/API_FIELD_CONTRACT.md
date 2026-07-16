# API Field Contract (FE ↔ APIAMIS)

Dokumen ini merangkum **mapping field kritis** agar frontend tidak menebak nama kolom database.

Sumber kebenaran response: **Laravel JsonResource / controller JSON** di `C:\laragon\www\apiamis`.  
Jangan mengasumsikan nama kolom DB (`n_kec`) sama dengan field API (`nama_kecamatan`).

Helper FE terkait wilayah: `src/lib/wilayah-fields.ts`.

---

## Aturan umum

1. Baca **Resource** (`app/Http/Resources/*`) sebelum menambah type FE.
2. Field API boleh alias; kolom DB boleh berbeda.
3. Query raw / eager-load select di backend harus memakai **nama kolom DB**.
4. Type FE idealnya mencerminkan **shape API**, bukan schema SQL.

---

## Wilayah

| DB table.column | API field (Resource) | FE type preferensi | Catatan |
|---|---|---|---|
| `tbl_kecamatan.n_kec` | `nama_kecamatan` | `Kecamatan.nama_kecamatan` | Alias di `KecamatanResource` |
| `tbl_desa.n_desa` | `nama_desa` | `Desa.nama_desa` | Alias di `DesaResource` |
| `tbl_desa.jumlah_kk` | `jumlah_kk` | `Desa.jumlah_kk` | Sinkron opendata |
| `tbl_desa.kecamatan_id` | `kecamatan_id` | sama | FK |

**Salah:** `select id, nama_kecamatan from tbl_kecamatan`  
**Benar (DB):** `select id, n_kec`  
**Benar (API client):** baca `nama_kecamatan`

Display helper:

```ts
import { getKecamatanName, getDesaName, formatLokasiWilayah } from '@/lib/wilayah-fields'
```

---

## Pekerjaan (inti)

| DB / model | API field tipikal | Catatan |
|---|---|---|
| `tbl_pekerjaan.nama_paket` | `nama_paket` | |
| `tbl_pekerjaan.pagu` | `pagu` | number/float |
| `tbl_pekerjaan.is_konsultan` | `is_konsultan` | boolean; tanpa desa/kec |
| `progress_total` | sering computed di resource | Jangan asumsikan selalu ada di list summary |
| `foto_count` / counts | whenCounted / appends | Cek list vs detail |

Scope data: query backend `byUserRole()` — FE filter tidak menggantikan otorisasi.

---

## Kontrak

| DB | API | Catatan |
|---|---|---|
| `tbl_kontrak.id_pekerjaan` | sering lewat relasi `pekerjaan` / pivot | Multi-pekerjaan via `pekerjaans` |
| `nilai_kontrak` | `nilai_kontrak` | DECIMAL — jangan integer-only |
| `kode_paket` / `kode_rup` | sama | Dipakai SPSE match |
| `tgl_spk`, `tgl_spmk`, `tgl_selesai` | date ISO / date string | |

---

## Media / OnlyOffice

| Konsep | Field | Catatan |
|---|---|---|
| Media Spatie | `media.id` | **Stabil** setelah save in-place OnlyOffice |
| File name | `file_name` | |
| Config editor | `mode`, `can_edit`, `download_url` | Query `?mode=view\|edit` |
| Download token | query `token` + `expires` | Atau user session auth |

---

## Checklist perubahan kontrak

- [ ] Resource / controller BE diubah?
- [ ] Type FE di `features/*/types` diselaraskan?
- [ ] Query raw BE (jika ada) pakai nama kolom DB?
- [ ] Test modul terkait / smoke path UI?

Workflow: [.agent/workflows/change-api-contract.md](workflows/change-api-contract.md).
