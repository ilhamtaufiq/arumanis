# Changelog ARUMANIS

Dokumentasi perubahan yang dilakukan pada aplikasi ARUMANIS.

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
