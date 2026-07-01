# Migrasi List — Tracker PR-2 / PR-3

**Terakhir diperbarui:** 23 Juni 2026  
**Tujuan:** Menyeragamkan halaman list ke shared components di `src/components/shared/`.

---

## Pola target (sudah distandarkan)

```tsx
<ListPageLayout shell title="..." description="..." cardTitle="..." action={...} toolbar={...} footer={...}>
  {isLoading ? <TableSkeleton /> : empty ? emptyState : <Table>...</Table>}
</ListPageLayout>

<ConfirmDeleteDialog open={!!deleteId} entityName="..." onConfirm={...} isPending={...} />
```

| Komponen | Path | Peran |
| --- | --- | --- |
| `ListPageLayout` | `src/components/shared/ListPageLayout.tsx` | Header page (`text-2xl`), Card, toolbar, footer; prop `shell` = `Header` + `Main` |
| `ListPagination` | `src/components/shared/ListPagination.tsx` | `variant="full"` (nomor halaman) atau `"simple"` (Sebelumnya/Berikutnya); opsional `meta` |
| `ConfirmDeleteDialog` | `src/components/shared/ConfirmDeleteDialog.tsx` | Dialog hapus terpusat; prop `entityName` wajib |
| `ListRowActions` | `src/components/shared/ListRowActions.tsx` | Edit (ghost + `Pencil`) + hapus; prop `edit` opsional |
| `SearchInput` | `src/components/shared/SearchInput.tsx` | Debounce search; ganti `Input` + manual debounce |
| `TableSkeleton` | `src/components/shared/TableSkeleton.tsx` | Ganti teks `"Loading..."` |

**Referensi implementasi:**

- List sederhana: `src/features/desa/components/DesaList.tsx`
- List dengan pagination meta: `src/features/users/components/UserList.tsx`
- List kompleks (toolbar + modal): `src/features/kontrak/components/KontrakList.tsx`
- List kompleks (filter banyak): `src/features/pekerjaan/components/PekerjaanList.tsx`
- List grouped/collapsible: `src/features/foto/components/FotoList.tsx`

---

## Sudah dimigrasi (14)

| File | Catatan |
| --- | --- |
| `src/features/users/components/UserList.tsx` | Full pattern |
| `src/features/roles/components/RoleList.tsx` | Full pattern |
| `src/features/permissions/components/PermissionList.tsx` | Full pattern |
| `src/features/desa/components/DesaList.tsx` | Full pattern |
| `src/features/kecamatan/components/KecamatanList.tsx` | Layout + delete; belum `ListPagination` (data kecil) |
| `src/features/kegiatan/components/KegiatanList.tsx` | Layout + delete; belum `ListPagination` (data kecil) |
| `src/features/kegiatan-role/components/KegiatanRoleList.tsx` | Delete-only row actions |
| `src/features/penyedia/components/PenyediaList.tsx` | Full pattern |
| `src/features/berkas/components/BerkasList.tsx` | Full pattern |
| `src/features/foto/components/FotoList.tsx` | Grouped collapsible + `variant="simple"` pagination |
| `src/features/kontrak/components/KontrakList.tsx` | Dropdown aksi tetap; delete terpusat |
| `src/features/pekerjaan/components/PekerjaanList.tsx` | Filter di children; bulk select tetap |

---

## Belum dimigrasi (11 + 2 khusus)

### Prioritas tinggi — halaman CRUD standar

| # | File | Pola lama | Kompleksitas | Catatan migrasi |
| --- | --- | --- | --- | --- |
| 1 | `src/features/pekerjaan/components/DraftPekerjaanList.tsx` | `Header`/`Main`, `Card`, `renderPagination`, `Dialog` publish | **Tinggi** | Mirip `PekerjaanList`; pertahankan dialog publish/bulk; ganti pagination → `ListPagination`; hapus → `ConfirmDeleteDialog` |
| 2 | `src/features/penerima/components/PenerimaList.tsx` | `Header`/`Main`, `renderPagination`, `Dialog` detail penerima | **Tinggi** | Read-only + sort; tidak ada delete; `ListPageLayout` + `ListPagination` + `SearchInput`; dialog detail tetap di luar layout |
| 3 | `src/features/pengawas/components/PengawasList.tsx` | `Header`/`Main`, stat cards, `AlertDialog` per baris | **Sedang** | Stat cards di atas `ListPageLayout` atau di dalam `children`; row → `ListRowActions` + `ConfirmDeleteDialog` |
| 4 | `src/features/kontrak/components/KontrakAddendumList.tsx` | `Header`/`Main`, pagination manual sederhana | **Rendah** | Migrasi straight-forward; nested di detail kontrak — pertimbangkan `shell={false}` jika parent sudah punya layout |

### Prioritas sedang — matrix / inline edit

| # | File | Pola lama | Kompleksitas | Catatan migrasi |
| --- | --- | --- | --- | --- |
| 5 | `src/features/route-permissions/components/RoutePermissionList.tsx` | Layout manual, search `Input`, pagination client-side, checkbox matrix | **Tinggi** | Bukan CRUD klasik; `ListPageLayout` untuk shell + search (`SearchInput`); pagination client-side → `ListPagination`; **tanpa** delete dialog |
| 6 | `src/features/menu-permissions/components/MenuPermissionList.tsx` | `Card`, `renderPagination`, checkbox matrix, save batch | **Tinggi** | Sama seperti route permissions; pertahankan tombol Save/Refresh di `action` atau `toolbar` |
| 7 | `src/features/master-fase/components/MasterFaseList.tsx` | `Card`, pagination manual, form inline via `Dialog` | **Sedang** | CRUD via modal — `ListPageLayout` + `ListRowActions` + `ConfirmDeleteDialog`; dialog create/edit tidak diubah |

### Prioritas rendah — log / output / tiket

| # | File | Pola lama | Kompleksitas | Catatan migrasi |
| --- | --- | --- | --- | --- |
| 8 | `src/features/audit-logs/components/AuditLogList.tsx` | `Header`/`Main`, filter tanggal, `Dialog` detail | **Sedang** | Read-only; stat/filter di `children`; pagination API → `ListPagination` |
| 9 | `src/features/error-logs/components/ErrorLogList.tsx` | `Header`/`Main`, stat cards, `Dialog` detail | **Sedang** | Mirip audit logs |
| 10 | `src/features/output/components/OutputList.tsx` | `Header`/`Main`, multi-card (filter + tabel), `AlertDialog` | **Tinggi** | Layout multi-section; migrasi bertahap: shell dulu, lalu delete terpusat |
| 11 | `src/features/tiket/components/TicketList.tsx` | Embedded (tanpa page shell), `AlertDialog` per baris, bulk update | **Tinggi** | **Bukan halaman penuh** — dipakai di pekerjaan & halaman tiket; `ListPageLayout` hanya jika `pekerjaanId` tidak ada; pertahankan `Dialog` komentar |

### Khusus — tidak wajib ikut pola dashboard

| File | Alasan skip / penyesuaian |
| --- | --- |
| `src/features/publikasi/components/PublikasiList.tsx` | Halaman publik/marketing (card grid, bukan tabel admin). **Jangan** pakai `ListPageLayout`. |
| `src/features/tiket/components/TicketCommentList.tsx` | Sub-komponen dalam `TicketList`. Tidak perlu migrasi terpisah. |

---

## Checklist per file (copy untuk PR)

```
[ ] Import: ListPageLayout, ListPagination, ConfirmDeleteDialog, SearchInput, TableSkeleton
[ ] Hapus: Header, Main, CardHeader/CardFooter manual (jika diganti layout)
[ ] Hapus: renderPagination() / Pagination inline duplikat
[ ] State: deleteId + ConfirmDeleteDialog terpusat (jika ada hapus)
[ ] Row: ListRowActions atau dropdown khusus (jika aksi > 2)
[ ] title: text-2xl via ListPageLayout (bukan text-3xl di list)
[ ] Loading: TableSkeleton (bukan "Loading..." / "Memuat data...")
[ ] npx tsc --noEmit
[ ] Smoke test: search, pagination, hapus, aksi khusus (export/import/modal)
```

---

## Urutan eksekusi yang disarankan

1. **Batch A (CRUD mirip master data):** `PengawasList` → `KontrakAddendumList`
2. **Batch B (domain pekerjaan):** `DraftPekerjaanList` → `PenerimaList`
3. **Batch C (permission matrix):** `RoutePermissionList` → `MenuPermissionList`
4. **Batch D (opsional):** `MasterFaseList` → `AuditLogList` → `ErrorLogList` → `OutputList` → `TicketList`

---

## Known gaps pada list yang sudah dimigrasi

| File | Gap |
| --- | --- |
| `KecamatanList.tsx` | Belum `ListPagination` (belum dibutuhkan — dataset kecil) |
| `KegiatanList.tsx` | Belum `ListPagination` (belum dibutuhkan — dataset kecil) |
| `KegiatanRoleList.tsx` | Hanya delete, tanpa tombol edit di row |

---

## PR terkait

| PR | Scope | Status |
| --- | --- | --- |
| PR-1 | Quick wins UI (Card, SearchInput, TableSkeleton, back button form) | ✅ Selesai |
| PR-2 | Shared list components + migrasi master data awal | ✅ Selesai |
| PR-3 | FormPageLayout + migrasi form/list lanjutan | 🟡 Sebagian (list besar done) |
| PR-4 | Dokumentasi UI guidelines (form + list) | 🟡 `FORM_STYLE_GUIDELINES.md` ada; list = file ini |

Setelah semua batch selesai, gabungkan isi file ini ke `.agent/FORM_STYLE_GUIDELINES.md` atau buat `LIST_STYLE_GUIDELINES.md` sebagai panduan permanen.