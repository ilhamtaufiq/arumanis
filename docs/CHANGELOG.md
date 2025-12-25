# Changelog ARUMANIS

Dokumentasi perubahan yang dilakukan pada aplikasi ARUMANIS.

> **Versi Saat Ini: v0.1.0-beta**

---

## [v0.1.0-beta] - 2025-12-25

### ✨ Fitur Baru
- **User Pekerjaan Assignment**: Admin dapat assign pekerjaan ke pengawas lapangan
  - Backend: Migration `user_pekerjaan`, Controller, Routes untuk CRUD assignments
  - Frontend: `AssignmentManager` untuk admin, `PengawasDashboard` untuk pengawas
  - Menu "Assign Pekerjaan" di sidebar (Pengaturan)
  - Pengawas hanya melihat pekerjaan yang di-assign padanya
- **Dashboard Role-Based**: Dashboard menampilkan konten berbeda berdasarkan role
  - Admin: Melihat semua statistik, chart, dan tombol Export
  - Non-Admin: Dashboard khusus pengawas dengan list pekerjaan assigned

### 🐛 Bug Fixes
- **Excel Export Button**: Fix TypeScript error pada button Export Excel
- **PekerjaanController show()**: Fix akses check dari KegiatanRole ke user_pekerjaan

### ♻️ Refactoring
- **ProgressTabContent**: Refactor komponen 2000+ baris menjadi modul terpisah
  - Extracted: `ProgressChart`, `date-helpers`, `excel-generator`

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
