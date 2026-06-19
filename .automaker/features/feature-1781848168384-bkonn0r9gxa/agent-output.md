
🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Explore existing docs structure and codebase for SPAM-Unit/Aset/SPM",
      "status": "in_progress",
      "activeForm": "Exploring existing docs structure and codebase"
    },
    {
      "content": "Plan document structure for SPAM-Unit user manual",
      "status": "pending",
      "activeForm": "Planning document structure"
    },
    {
      "content": "Create panduan-spam-unit.md main document",
      "status": "pending",
      "activeForm": "Creating main document"
    },
    {
      "content": "Create per-bab documentation files",
      "status": "pending",
      "activeForm": "Creating per-chapter documentation files"
    },
    {
      "content": "Update docs/user-guide/index.md with new module",
      "status": "pending",
      "activeForm": "Updating index"
    },
    {
      "content": "Final review and output summary",
      "status": "pending",
      "activeForm": "Final review"
    }
  ]
}
Both exploration agents are still running. Let me check the actual codebase directly while waiting.

🔧 Tool: Glob
Input: {
  "pattern": "docs/user-guide/**/*.md"
}

🔧 Tool: Glob
Input: {
  "pattern": "**/spam*/**/*.{tsx,ts,jsx,js}",
  "path": "C:\\laragon\\www\\bun\\src"
}

🔧 Tool: Glob
Input: {
  "pattern": "**/aset*/**/*.{tsx,ts,jsx,js}",
  "path": "C:\\laragon\\www\\bun\\src"
}

🔧 Tool: Glob
Input: {
  "pattern": "**/spm*/**/*.{tsx,ts,jsx,js}",
  "path": "C:\\laragon\\www\\bun\\src"
}
Panel analysis: consensus on module location (`src/features/spam-unit/`) and doc dir (`docs/user-guide/`). Contradiction: flat vs subdir. Previous feature uses flat files (`kegiatan.md`, `desa-kecamatan.md`, etc.) — follow that pattern. Blind spot in all sources: nobody read existing doc files for format. I'll fix that now.

Let me read all source files + existing docs for pattern matching.

🔧 Tool: Read
Input: {
  "file_path": "C:\\laragon\\www\\bun\\src\\features\\spam-unit\\index.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\laragon\\www\\bun\\src\\features\\spam-unit\\types\\index.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\laragon\\www\\bun\\src\\features\\spam-unit\\api\\index.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\laragon\\www\\bun\\src\\features\\spam-unit\\components\\SpamUnitPage.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\laragon\\www\\bun\\src\\routes\\_authenticated\\spam-unit\\index.tsx"
}
Let me read the component and existing docs to match format precisely.

🔧 Tool: Read
Input: {
  "file_path": "C:\\laragon\\www\\bun\\src\\features\\spam-unit\\components\\SpamUnitPage.tsx",
  "limit": 200
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\laragon\\www\\bun\\docs\\user-guide\\kegiatan.md"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\laragon\\www\\bun\\docs\\user-guide\\desa-kecamatan.md"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\laragon\\www\\bun\\docs\\user-guide\\index.md"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\laragon\\www\\bun\\src\\features\\spam-unit\\components\\SpamUnitPage.tsx",
  "offset": 200,
  "limit": 400
}

🔧 Tool: Grep
Input: {
  "pattern": "verif|status|approv|reject|terima|tolak|verifikasi",
  "path": "C:\\laragon\\www\\bun\\src\\features\\spam-unit",
  "output_mode": "content"
}

🔧 Tool: Grep
Input: {
  "pattern": "capaian|spm|sPM|Spm",
  "path": "C:\\laragon\\www\\bun\\src",
  "output_mode": "files_with_matches"
}

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "activeForm": "Exploring existing docs and codebase",
      "content": "Explore existing docs structure and codebase for SPAM-Unit/Aset/SPM",
      "status": "completed"
    },
    {
      "activeForm": "Planning document structure",
      "content": "Plan document structure for SPAM-Unit user manual",
      "status": "completed"
    },
    {
      "activeForm": "Creating spam-unit.md main document",
      "content": "Create docs/user-guide/spam-unit.md",
      "status": "in_progress"
    },
    {
      "activeForm": "Updating index.md with new module",
      "content": "Update docs/user-guide/index.md with new module link",
      "status": "pending"
    },
    {
      "activeForm": "Final review and summary",
      "content": "Final review and output summary",
      "status": "pending"
    }
  ]
}
Panel consensus: file `docs/user-guide/spam-unit.md`, flat format matching `kegiatan.md`, covering Unit CRUD, Achievements (Capaian SPM), Budgets, Pengelola, Import, Filters, Stats, Roles. No panelist wrote final file yet — proceeding now.

🔧 Tool: Write
Input: {
  "file_path": "C:\\laragon\\www\\bun\\docs\\user-guide\\spam-unit.md",
  "content": "# SPAM Unit — Data Unit & Capaian SPM\n\n**URL:** `/spam-unit`\n**Fitur:** CRUD unit SPAM, capaian SPM, pengelola, anggaran, impor data\n\n## Tujuan\n\nModul SPAM Unit mengelola data unit Sarana Penyediaan Air Minum (SPAM) di setiap desa. Setiap unit mencatat kapasitas layanan, struktur pengelolaan, capaian sambungan rumah (SR) dan jiwa terlayani (SPM), serta rencana anggaran.\n\n---\n\n## Tampilan Halaman\n\n### Ringkasan Statistik (KPI Cards)\n\n| Metrik | Sumber Data |\n|--------|-------------|\n| Total Unit SPAM | Jumlah seluruh unit |\n| Total KK (JP) | `jumlah_kk` dari achievement |\n| Total KK (BJP) | `jumlah_bjp_kk` dari achievement |\n| Total Layanan Jiwa | `jumlah_jiwa` dari achievement |\n| Goal Akhir SPM | Persentase coverage |\n\n### Filter & Pencarian\n\n| Filter | Tipe | Deskripsi |\n|--------|------|-----------|\n| Pencarian | Teks | Cari nama unit |\n| Kecamatan | Dropdown | Filter wilayah |\n| Desa | Dropdown | Muncul setelah kecamatan dipilih |\n| Status SIMSPAM | Pilihan (Ya/Tidak/Semua) | Filter unit SIMSPAM |\n| Tahun | Tahun | Filter capaian per tahun |\n\n---\n\n## Field Data Unit SPAM\n\n### Data Pokok\n\n| Field | Tipe | Validasi |\n|-------|------|----------|\n| Desa | Dropdown | Wajib, pilih kecamatan dulu |\n| Nama Unit | Teks | Opsional |\n| Terdaftar SIMSPAM | Toggle (Ya/Tidak) | Wajib |\n| Sistem Layanan | Teks | Opsional |\n| Kapasitas Mata Air | Angka (ltr/dtk) | Opsional |\n| Kapasitas Air Tanah | Angka (ltr/dtk) | Opsional |\n| Kapasitas Lain-lain | Angka (ltr/dtk) | Opsional |\n\n### Data Pengelola (POKMAS)\n\n| Field | Tipe | Validasi |\n|-------|------|----------|\n| Nama POKMAS | Teks | Opsional |\n| Nomor Perdes | Teks | Opsional |\n| Ketua | Teks | Opsional |\n| Bendahara | Teks | Opsional |\n| Sekretaris | Teks | Opsional |\n\n### Capaian SPM (Achievement)\n\n| Field | Tipe | Validasi |\n|-------|------|----------|\n| Tahun | Tahun | Wajib |\n| Jumlah SR (Sambungan Rumah) | Angka | Wajib, ≥ 0 |\n| Jumlah KK (JP) | Angka | Wajib, ≥ 0 |\n| Jumlah Jiwa | Angka | Wajib, ≥ 0 |\n| Jumlah KK BJP | Angka | Opsional, ≥ 0 |\n| Jumlah Jiwa BJP | Angka | Opsional, ≥ 0 |\n| Catatan | Textarea | Opsional |\n\n### Rencana Anggaran (Budget)\n\n| Field | Tipe | Validasi |\n|-------|------|----------|\n| Tahun | Tahun | Wajib |\n| Nilai Kontrak | Angka (Rupiah) | Wajib, ≥ 0 |\n| Nama Paket | Teks | Opsional |\n| Sumber Dana | Pilihan (APBD/APBN/Dana Desa/Lainnya) | Opsional |\n\n---\n\n## Langkah Penggunaan\n\n### Tambah Unit SPAM Baru\n\n1. Klik tombol **Tambah Unit** (icon `+`)\n2. Pilih **Kecamatan** → **Desa** tempat unit berada\n3. Isi **Nama Unit** (jika ada)\n4. Atur toggle **Terdaftar SIMSPAM**\n5. Isi kapasitas layanan (mata air, air tanah, lain-lain) dalam liter/detik\n6. Isi data pengelola POKMAS jika tersedia\n7. Klik **Simpan**\n\n### Edit Unit SPAM\n\n1. Klik ikon **✏️ Edit** pada baris unit\n2. Ubah data yang diperlukan\n3. Klik **Simpan**\n\n### Hapus Unit SPAM\n\n1. Klik ikon **🗑️ Hapus**\n2. Konfirmasi dialog\n\n### Impor Data dari CSV/Excel\n\n1. Klik tombol **Import** (icon `Upload`)\n2. Pilih file dengan format sesuai template\n3. Klik **Upload**\n4. Sistem memproses dan menampilkan hasil\n\n### Lihat Detail Unit\n\n1. Klik ikon **👁️ Lihat**\n2. Tab tersedia:\n\n| Tab | Isi |\n|-----|-----|\n| **Info** | Data pokok unit, kapasitas layanan |\n| **Pengelola** | Struktur POKMAS, Perdes |\n| **Achievements** | Capaian SPM per tahun (SR, KK, Jiwa, BJP) |\n| **Budgets** | Rencana anggaran, nilai kontrak, sumber dana |\n\n### Tambah Capaian SPM (Achievement)\n\n1. Buka detail unit → tab **Achievements**\n2. Klik **Tambah Achievement**\n3. Isi: Tahun, Jumlah SR, KK, Jiwa, BJP KK, BJP Jiwa\n4. Klik **Simpan**\n\n### Tambah Anggaran (Budget)\n\n1. Buka detail unit → tab **Budgets**\n2. Klik **Tambah Budget**\n3. Isi: Tahun, Nilai Kontrak, Nama Paket, Sumber Dana\n4. Klik **Simpan**\n\n### Hapus Anggaran\n\n1. Buka detail unit → tab **Budgets**\n2. Klik ikon **🗑️** pada baris anggaran\n3. Konfirmasi\n\n---\n\n## Notifikasi & Error\n\n| Pesan | Makna |\n|-------|-------|\n| `Unit SPAM berhasil ditambahkan!` | Sukses simpan |\n| `Unit SPAM berhasil diperbarui!` | Sukses update |\n| `Unit SPAM berhasil dihapus!` | Sukses hapus |\n| `Data SPAM berhasil diimport!` | Sukses impor |\n| `Gagal menambahkan unit SPAM.` | Error server/validasi |\n| `Gagal memperbarui unit SPAM.` | Error server/validasi |\n| `Gagal menghapus unit SPAM.` | Mungkin masih dirujuk |\n| `Gagal mengimport data SPAM.` | Format file tidak sesuai |\n\n---\n\n## Perilaku Khusus Role\n\n| Role | Unit SPAM | Capaian SPM | Anggaran | Import |\n|------|-----------|-------------|----------|--------|\n| **Admin** | CRUD penuh | CRUD penuh | CRUD penuh | Ya |\n| **Operator** | Tambah/edit (wilayah) | Tambah (wilayah) | Tambah (wilayah) | Ya |\n| **Viewer** | Lihat & statistik | Lihat | Lihat | Tidak |\n\n---\n\n## Troubleshooting\n\n| Masalah | Penyebab | Solusi |\n|---------|----------|--------|\n| Desa tidak muncul di dropdown | Kecamatan belum dipilih | Pilih kecamatan dulu |\n| Gagal simpan unit | Field wajib kosong | Lengkapi data desa dan SIMSPAM |\n| Gagal import | Format file tidak sesuai | Gunakan template CSV yang benar |\n| Data tidak muncul setelah simpan | Belum refresh | Klik filter atau reload halaman |\n| Tidak bisa menghapus unit | Data masih dirujuk | Hapus capaian/anggaran terkait dulu |\n\n---\n\n## Integrasi dengan Modul Lain\n\nData unit SPAM digunakan sebagai referensi di:\n- **Progress/Capaian** — Pelaporan capaian SPM lintas unit\n- **Laporan/Export** — Data aset dan capaian diekspor ke PDF/Excel\n\n---\n\n> **Versi Dokumen:** 1.0 — Terakhir diperbarui: Juni 2026\n"
}
Facts confirmed by panel consensus:

1. **Caller:** `docs/user-guide/index.md` — new table row under "Panduan per Modul"
2. **No duplicate:** Glob `docs/user-guide/**/*.md` → no `spam-unit.md` exists
3. **Data structure (from source):**
   - `UnitSpam`: `{ desa_id, name, is_simspam, sistem_layanan, sumber_mata_air_kap, sumber_air_tanah_kap, lain_lain_kap }`
   - `SpamAchievement`: `{ unit_spam_id, tahun (YYYY), jumlah_sr, jumlah_kk, jumlah_jiwa, jumlah_bjp_kk, jumlah_bjp_jiwa, catatan }`
   - `SpamBudget`: `{ unit_spam_id, tahun (YYYY), nilai_kontrak, nama_paket, sumber_dana }`
4. **Instruction verbatim:** "Buat Panduan Pengguna (User Manual) Modul SPAM-Unit / Aset & Capaian SPM"

Retrying write.

🔧 Tool: Write
Input: {
  "file_path": "C:\\laragon\\www\\bun\\docs\\user-guide\\spam-unit.md",
  "content": "# SPAM Unit — Data Unit & Capaian SPM\n\n**URL:** `/spam-unit`\n**Fitur:** CRUD unit SPAM, capaian SPM, pengelola, anggaran, impor data\n\n## Tujuan\n\nModul SPAM Unit mengelola data unit Sarana Penyediaan Air Minum (SPAM) di setiap desa. Setiap unit mencatat kapasitas layanan, struktur pengelolaan, capaian sambungan rumah (SR) dan jiwa terlayani (SPM), serta rencana anggaran.\n\n---\n\n## Tampilan Halaman\n\n### Ringkasan Statistik (KPI Cards)\n\n| Metrik | Sumber Data |\n|--------|-------------|\n| Total Unit SPAM | Jumlah seluruh unit |\n| Total KK (JP) | `jumlah_kk` dari achievement |\n| Total KK (BJP) | `jumlah_bjp_kk` dari achievement |\n| Total Layanan Jiwa | `jumlah_jiwa` dari achievement |\n| Goal Akhir SPM | Persentase coverage |\n\n### Filter & Pencarian\n\n| Filter | Tipe | Deskripsi |\n|--------|------|-----------|\n| Pencarian | Teks | Cari nama unit |\n| Kecamatan | Dropdown | Filter wilayah |\n| Desa | Dropdown | Muncul setelah kecamatan dipilih |\n| Status SIMSPAM | Pilihan (Ya/Tidak/Semua) | Filter unit SIMSPAM |\n| Tahun | Tahun | Filter capaian per tahun |\n\n---\n\n## Field Data Unit SPAM\n\n### Data Pokok\n\n| Field | Tipe | Validasi |\n|-------|------|----------|\n| Desa | Dropdown | Wajib, pilih kecamatan dulu |\n| Nama Unit | Teks | Opsional |\n| Terdaftar SIMSPAM | Toggle (Ya/Tidak) | Wajib |\n| Sistem Layanan | Teks | Opsional |\n| Kapasitas Mata Air | Angka (ltr/dtk) | Opsional |\n| Kapasitas Air Tanah | Angka (ltr/dtk) | Opsional |\n| Kapasitas Lain-lain | Angka (ltr/dtk) | Opsional |\n\n### Data Pengelola (POKMAS)\n\n| Field | Tipe | Validasi |\n|-------|------|----------|\n| Nama POKMAS | Teks | Opsional |\n| Nomor Perdes | Teks | Opsional |\n| Ketua | Teks | Opsional |\n| Bendahara | Teks | Opsional |\n| Sekretaris | Teks | Opsional |\n\n### Capaian SPM (Achievement)\n\n| Field | Tipe | Validasi |\n|-------|------|----------|\n| Tahun | Tahun | Wajib |\n| Jumlah SR (Sambungan Rumah) | Angka | Wajib, >= 0 |\n| Jumlah KK (JP) | Angka | Wajib, >= 0 |\n| Jumlah Jiwa | Angka | Wajib, >= 0 |\n| Jumlah KK BJP | Angka | Opsional, >= 0 |\n| Jumlah Jiwa BJP | Angka | Opsional, >= 0 |\n| Catatan | Textarea | Opsional |\n\n### Rencana Anggaran (Budget)\n\n| Field | Tipe | Validasi |\n|-------|------|----------|\n| Tahun | Tahun | Wajib |\n| Nilai Kontrak | Angka (Rupiah) | Wajib, >= 0 |\n| Nama Paket | Teks | Opsional |\n| Sumber Dana | Pilihan (APBD/APBN/Dana Desa/Lainnya) | Opsional |\n\n---\n\n## Langkah Penggunaan\n\n### Tambah Unit SPAM Baru\n\n1. Klik tombol **Tambah Unit** (icon `+`)\n2. Pilih **Kecamatan** -> **Desa** tempat unit berada\n3. Isi **Nama Unit** (jika ada)\n4. Atur toggle **Terdaftar SIMSPAM**\n5. Isi kapasitas layanan (mata air, air tanah, lain-lain) dalam liter/detik\n6. Isi data pengelola POKMAS jika tersedia\n7. Klik **Simpan**\n\n### Edit Unit SPAM\n\n1. Klik ikon **Edit** pada baris unit\n2. Ubah data yang diperlukan\n3. Klik **Simpan**\n\n### Hapus Unit SPAM\n\n1. Klik ikon **Hapus**\n2. Konfirmasi dialog\n\n### Impor Data dari CSV/Excel\n\n1. Klik tombol **Import** (icon Upload)\n2. Pilih file dengan format sesuai template\n3. Klik **Upload**\n4. Sistem memproses dan menampilkan hasil\n\n### Lihat Detail Unit\n\n1. Klik ikon **Lihat**\n2. Tab tersedia:\n\n| Tab | Isi |\n|-----|-----|\n| **Info** | Data pokok unit, kapasitas layanan |\n| **Pengelola** | Struktur POKMAS, Perdes |\n| **Achievements** | Capaian SPM per tahun (SR, KK, Jiwa, BJP) |\n| **Budgets** | Rencana anggaran, nilai kontrak, sumber dana |\n\n### Tambah Capaian SPM (Achievement)\n\n1. Buka detail unit -> tab **Achievements**\n2. Klik **Tambah Achievement**\n3. Isi: Tahun, Jumlah SR, KK, Jiwa, BJP KK, BJP Jiwa\n4. Klik **Simpan**\n\n### Tambah Anggaran (Budget)\n\n1. Buka detail unit -> tab **Budgets**\n2. Klik **Tambah Budget**\n3. Isi: Tahun, Nilai Kontrak, Nama Paket, Sumber Dana\n4. Klik **Simpan**\n\n### Hapus Anggaran\n\n1. Buka detail unit -> tab **Budgets**\n2. Klik ikon **Hapus** pada baris anggaran\n3. Konfirmasi\n\n---\n\n## Notifikasi & Error\n\n| Pesan | Makna |\n|-------|-------|\n| `Unit SPAM berhasil ditambahkan!` | Sukses simpan |\n| `Unit SPAM berhasil diperbarui!` | Sukses update |\n| `Unit SPAM berhasil dihapus!` | Sukses hapus |\n| `Data SPAM berhasil diimport!` | Sukses impor |\n| `Gagal menambahkan unit SPAM.` | Error server/validasi |\n| `Gagal memperbarui unit SPAM.` | Error server/validasi |\n| `Gagal menghapus unit SPAM.` | Mungkin masih dirujuk |\n| `Gagal mengimport data SPAM.` | Format file tidak sesuai |\n\n---\n\n## Perilaku Khusus Role\n\n| Role | Unit SPAM | Capaian SPM | Anggaran | Import |\n|------|-----------|-------------|----------|--------|\n| **Admin** | CRUD penuh | CRUD penuh | CRUD penuh | Ya |\n| **Operator** | Tambah/edit (wilayah) | Tambah (wilayah) | Tambah (wilayah) | Ya |\n| **Viewer** | Lihat & statistik | Lihat | Lihat | Tidak |\n\n---\n\n## Troubleshooting\n\n| Masalah | Penyebab | Solusi |\n|---------|----------|--------|\n| Desa tidak muncul di dropdown | Kecamatan belum dipilih | Pilih kecamatan dulu |\n| Gagal simpan unit | Field wajib kosong | Lengkapi data desa dan SIMSPAM |\n| Gagal import | Format file tidak sesuai | Gunakan template CSV yang benar |\n| Data tidak muncul setelah simpan | Belum refresh | Klik filter atau reload halaman |\n| Tidak bisa menghapus unit | Data masih dirujuk | Hapus capaian/anggaran terkait dulu |\n\n---\n\n## Integrasi dengan Modul Lain\n\nData unit SPAM digunakan sebagai referensi di:\n- **Progress/Capaian** -- Pelaporan capaian SPM lintas unit\n- **Laporan/Export** -- Data aset dan capaian diekspor ke PDF/Excel\n\n---\n\n> **Versi Dokumen:** 1.0 -- Terakhir diperbarui: Juni 2026\n"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\laragon\\www\\bun\\docs\\user-guide\\index.md"
}
All 4 sources agree on the required edit: add SPAM Unit entry to `docs/user-guide/index.md`. Placement is the key difference — inserting after Settings (before Panduan Lintas Modul section) is cleanest, doesn't disrupt any existing alphabetical/functional grouping.

🔧 Tool: Edit
Input: {
  "replace_all": false,
  "file_path": "C:\\laragon\\www\\bun\\docs\\user-guide\\index.md",
  "old_string": "| [Settings](settings.md) | Konfigurasi aplikasi | `/settings` |\n\n### 3. Panduan Lintas Modul",
  "new_string": "| [Settings](settings.md) | Konfigurasi aplikasi | `/settings` |\n| [SPAM Unit](spam-unit.md) | Data unit SPAM, capaian SPM, anggaran | `/spam-unit` |\n\n### 3. Panduan Lintas Modul"
}

🔧 Tool: Edit
Input: {
  "replace_all": false,
  "file_path": "C:\\laragon\\www\\bun\\docs\\user-guide\\index.md",
  "old_string": "| [Settings](settings.md) | Konfigurasi aplikasi | `/settings` |\n\n### 3. Panduan Lintas Modul",
  "new_string": "| [Settings](settings.md) | Konfigurasi aplikasi | `/settings` |\n| [SPAM Unit](spam-unit.md) | Data unit SPAM, capaian SPM, anggaran | `/spam-unit` |\n\n### 3. Panduan Lintas Modul"
}
Final review — verifying created files.

🔧 Tool: Read
Input: {
  "file_path": "C:\\laragon\\www\\bun\\docs\\user-guide\\spam-unit.md"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\laragon\\www\\bun\\docs\\user-guide\\index.md"
}
Done. Created user manual for module SPAM Unit & Capaian SPM.

**2 files:**

| File | Action |
|------|--------|
| `docs/user-guide/spam-unit.md` | Created — full module docs |
| `docs/user-guide/index.md` | Updated — added table entry |

**What's covered:**
- Module overview, KPI stats, filter/search
- Data fields: Unit Pokok, Pengelola (POKMAS), Achievement (Capaian SPM), Budget
- Step-by-step CRUD, import CSV, detail tabs (Info/Pengelola/Achievements/Budgets)
- Role permissions (Admin/Operator/Viewer)
- Troubleshooting table
- Integrated with existing doc index

<summary>
## Summary: Buat Panduan Pengguna (User Manual) Modul SPAM-Unit / Aset & Capaian SPM

### Changes Implemented
- Created `docs/user-guide/spam-unit.md` documenting SPAM Unit module: purpose, KPI stats, filters, data fields (Unit, Pengelola, Achievement, Budget), step-by-step usage for CRUD/import/detail tabs, role-based permissions, troubleshooting
- Added SPAM Unit entry to main docs index with link and description

### Files Modified
- `docs/user-guide/spam-unit.md` (Created)
- `docs/user-guide/index.md` (Modified)

### Notes for Developer
- Follows flat-file format matching existing modules (`kegiatan.md`, `desa-kecamatan.md`)
- Field names/types/validations extracted from `src/features/spam-unit/types/index.ts` and `SpamUnitPage.tsx`
- No new functionality — pure documentation for existing implementation
</summary>