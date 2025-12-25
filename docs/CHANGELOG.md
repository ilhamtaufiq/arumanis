# Changelog ARUMANIS

Dokumentasi perubahan yang dilakukan pada aplikasi ARUMANIS.

> **Versi Saat Ini: v0.1.0-beta**

---

## [v0.1.1-beta] - 2025-12-25

### ✨ Fitur Baru
- **Dual Assignment System**: Mendukung penugasan pekerjaan secara manual maupun berbasis Role Kegiatan.
  - Backend: Update `scopeByUserRole` dan access check di `PekerjaanController`.
  - Frontend: Indikator badge (Manual/Role) pada Dashboard Pengawas.
- **Unified CRUD Forms**: Form Tambah dan Edit pada tab **Output**, **Penerima**, dan **Berkas** disatukan untuk UX yang lebih baik (Inline Editing).
  - Dilengkapi fitur *auto-scroll* dan mode *update* tanpa pindah halaman.
- **Authentication Guard**: Proteksi rute frontend menggunakan `beforeLoad` hook untuk redirect user belum login ke halaman Sign-in.

### 🐛 Bug Fixes
- **Search Context**: Perbaikan error `useSearch has to be used within SearchProvider`.
- **CORS Policy**: Penyesuaian `allowed_origins` untuk mendukung berbagai domain frontend (local & prod).
- **Access Control Detail**: Perbaikan bug "Failed to fetch pekerjaan" pada halaman detail untuk user dengan akses berbasis role.

### ♻️ Refactoring
- **Output, Penerima, Berkas Tab**: Penghapusan rute-rute edit terpisah dan migrasi logic ke komponen inline.

---

## [v0.1.0-beta] - 2025-12-25

---

## [2025-12-25] - User Pekerjaan Assignment

### Deskripsi
Fitur untuk admin mengassign pengawas lapangan ke pekerjaan tertentu.

### Backend (apiamis)
| File | Perubahan |
|------|-----------|
| `database/migrations/2025_12_25_000001_create_user_pekerjaan_table.php` | Pivot table user-pekerjaan |
| `app/Models/User.php` | Tambah `assignedPekerjaan()` relationship |
| `app/Models/Pekerjaan.php` | Tambah `assignedUsers()` relationship, update `scopeByUserRole` |
| `app/Http/Controllers/UserPekerjaanController.php` | CRUD untuk assignments |
| `app/Http/Controllers/PekerjaanController.php` | Update akses check di `show()` |
| `routes/api.php` | 6 endpoint baru untuk user-pekerjaan |

### Frontend (arumanis)
| File | Perubahan |
|------|-----------|
| `src/features/user-pekerjaan/api/user-pekerjaan.ts` | API client |
| `src/features/user-pekerjaan/components/AssignmentManager.tsx` | UI admin |
| `src/features/user-pekerjaan/components/PengawasDashboard.tsx` | Dashboard pengawas |
| `src/routes/_authenticated/user-pekerjaan/index.tsx` | Route halaman |
| `src/components/layout/data/sidebar-data.ts` | Menu sidebar |
| `src/features/dashboard/components/Dashboard.tsx` | Render PengawasDashboard untuk non-admin |

### API Endpoints
```
GET    /api/user-pekerjaan                  - List semua assignments
POST   /api/user-pekerjaan                  - Assign pekerjaan ke user
DELETE /api/user-pekerjaan/{id}             - Hapus assignment
GET    /api/user-pekerjaan/user/{userId}    - List by user
GET    /api/user-pekerjaan/pekerjaan/{id}   - List by pekerjaan
GET    /api/user-pekerjaan/available-users  - List user non-admin
```

---

## [2025-12-25] - Dashboard Role-Based Visibility

### Deskripsi
Dashboard sekarang menampilkan konten berbeda berdasarkan role user:
- **Admin**: Melihat semua statistik, chart, dan tombol Export
- **Non-Admin**: Hanya melihat greeting/sapaan dengan nama user

### File yang Diubah

#### `src/features/dashboard/components/Dashboard.tsx`

**Perubahan:**
1. **Import `useAuthStore`** untuk akses data user yang login
2. **Tambah variabel `isAdmin`** untuk cek role admin
   ```tsx
   const { auth } = useAuthStore()
   const isAdmin = auth.user?.roles?.includes('admin') ?? false
   ```
3. **Optimasi query** - hanya fetch data jika admin
   ```tsx
   const { data: stats, isLoading, error } = useQuery({
       queryKey: ['dashboard-stats', tahunAnggaran],
       queryFn: () => getDashboardStats(tahunAnggaran),
       enabled: isAdmin, // Only fetch stats if admin
   })
   ```
4. **Greeting dinamis** berdasarkan role
   - Admin: "Dashboard"
   - Non-Admin: "Selamat Datang, {nama}!"
5. **Sembunyikan stats & charts** untuk non-admin menggunakan conditional rendering `{isAdmin && (...)}`
6. **Sembunyikan tombol Export** untuk non-admin

---

## [2025-12-25] - Fix Excel Generator Type Error

### Deskripsi
Memperbaiki TypeScript error pada button Export Excel yang tidak compatible dengan `onClick` handler.

### File yang Diubah

#### `src/features/pekerjaan/components/ProgressTabContent.tsx`

**Masalah:**
```
Type '({ report, weekCount, dpaData }: ExcelGeneratorParams) => void' is not assignable to type 'MouseEventHandler<HTMLButtonElement>'
```

**Solusi:**
Mengubah `onClick={generateExcel}` menjadi `onClick={handleGenerateExcel}` karena:
- `generateExcel` membutuhkan parameter `{ report, weekCount, dpaData }`
- `onClick` memberikan `MouseEvent` sebagai parameter
- `handleGenerateExcel` adalah wrapper function yang memanggil `generateExcel` dengan parameter yang benar

**Perubahan:**
```diff
- <Button variant="outline" size="sm" onClick={generateExcel}>
+ <Button variant="outline" size="sm" onClick={handleGenerateExcel}>
```

---

## [2025-12-24] - Refactor ProgressTabContent Component

### Deskripsi
Refactoring komponen `ProgressTabContent.tsx` yang sebelumnya berukuran 2000+ baris menjadi modul-modul yang lebih kecil dan terorganisir.

### Struktur Baru

```
src/features/progress/
├── components/
│   ├── index.ts
│   └── ProgressChart.tsx       # S-Curve chart component
├── types/
│   ├── index.ts
│   ├── exports.ts              # PDF/Excel export types
│   └── signature.ts            # Signature data types
└── utils/
    ├── index.ts
    ├── date-helpers.ts         # Date formatting utilities
    └── excel-generator.ts      # Excel export logic
```

### File Baru yang Dibuat

| File | Deskripsi |
|------|-----------|
| `ProgressChart.tsx` | Komponen chart kurva S untuk visualisasi progress |
| `date-helpers.ts` | Helper functions untuk format tanggal dan kalkulasi minggu |
| `excel-generator.ts` | Logic untuk generate file Excel |
| `signature.ts` | Type definitions untuk data tanda tangan |
| `exports.ts` | Type definitions untuk PDF/Excel export |

### Manfaat Refactoring
- ✅ Code lebih terorganisir dan mudah di-maintain
- ✅ Reusability komponen dan utilities
- ✅ Separation of concerns yang lebih baik
- ✅ Testing lebih mudah untuk unit yang lebih kecil
