# Domain Boundaries

Panduan menjaga maintainability: **perbaiki domain inti sebelum menambah domain baru**.

---

## Domain sentral (sentuh hati-hati)

Urutan dampak (tinggi → rendah):

1. **pekerjaan** — pusat relasi
2. **kontrak** (+ addendum, register, BAP)
3. **progress** / **buat-laporan** / **foto**
4. **berkas** / **documents (OnlyOffice)**
5. **pengawas** / **checklist** / **penerima** / **output**
6. **puspen** (command center terpisah secara UI)

Perubahan field di (1)–(3) hampir selalu full-stack.

---

## Domain integrasi (ops + env)

| Domain | Dependensi eksternal | Runbook |
|---|---|---|
| OnlyOffice | Document Server, APP_URL, JWT | [docs/runbooks/onlyoffice.md](../docs/runbooks/onlyoffice.md) |
| WhatsApp | Bridge Baileys lokal | [docs/runbooks/whatsapp.md](../docs/runbooks/whatsapp.md) |
| SPSE | Cookie session LPSE | [docs/runbooks/spse.md](../docs/runbooks/spse.md) |
| SIPD | Proxy + cache service | server sipd-proxy |
| Instagram | Meta Graph | docs/instagram-meta-setup.md |

Jangan menambah integrasi baru tanpa runbook + owner ops.

---

## Domain “boleh tumbuh” (lebih aman)

- Master data: desa, kecamatan, kegiatan (CRUD tipis)
- Settings, notifications, audit/error logs
- Publikasi (terisolasi relatif)
- Tools kecil (RAB analyzer client-side)

---

## Aturan keputusan fitur baru

**Lanjut** jika:

- Memakai API/contract yang sudah ada, atau
- Menutup gap di rantai: SIPD/SPSE → pekerjaan → kontrak → progress → laporan → publik

**Tunda / tolak dulu** jika:

- Domain baru tanpa owner & tanpa test path
- Menyentuh pekerjaan/kontrak tanpa verifikasi resource BE
- Duplikasi modul yang sudah ada (lihat `src/features/*`)

---

## File besar (hot-spot)

Hindari menambah logika ke file > ~800 baris. Prefer extract ke:

- `features/<domain>/lib/*`
- `features/<domain>/components/<sub>/*`
- hooks terpisah

Hot-spot saat ini (orientasi):

| File | Arah extract |
|---|---|
| `simulation/NetworkEditorPage.tsx` | `editor/NetworkMapHelpers` (icons + map effects) — lanjut pecah toolbar/panels |
| `pekerjaan/FotoTabContent.tsx` | `lib/foto-tab` (progress levels + normalize) — lanjut gallery/dialog |
| `pekerjaan/RegisterDokumen.tsx` | `register/*` + `lib/register-dokumen` |
| `berkas/MediaLibrary.tsx` | constants di `media-library-utils` — lanjut zone components |
| `kontrak/KontrakList.tsx` | `KontrakRow` + `lib/kontrak-list-utils` |

Display lokasi paket: pakai `@/lib/wilayah-fields` (`formatPekerjaanLokasi` / `formatLokasiWilayah`), jangan hardcode `n_kec` / `nama_kecamatan` campur-aduk.

---

## Dual repo

```text
bun (FE)  ↔  apiamis (BE)
```

Kontrak berubah → update **kedua** repo di PR/commit yang selaras.  
Lihat [API_FIELD_CONTRACT.md](API_FIELD_CONTRACT.md).
