# System Audit — Arumanis + APIAMIS

**Tanggal:** 23 Juni 2026  
**Versi frontend:** 0.4.0  
**Scope:** Full-stack (frontend `bun` + backend `apiamis`)

---

## 1. Ringkasan Eksekutif

| Area | Status | Skor |
| --- | --- | --- |
| Build production | ✅ Lulus | A |
| Unit test | ⚠️ 75/75 lulus, worker crash | B |
| ESLint | ⚠️ 0 error, 22 warning | B+ |
| Arsitektur feature-first | ✅ Konsisten | A |
| Integrasi API | ✅ Mayoritas via `api-client` | A- |
| Test coverage fitur | ❌ Hanya 3/41 fitur | D |
| Bundle size | ⚠️ Main chunk ~6 MB | C |
| Dokumentasi vs kode | ⚠️ Ada mismatch | B |

**Kesimpulan:** Sistem produktif dan buildable. Domain inti (`pekerjaan` dan turunannya) matang, tetapi coverage test rendah, pola data-fetching belum seragam, dan bundle utama terlalu besar untuk first load.

---

## 2. Stack & Environment

### Frontend (`C:\laragon\www\bun`)

| Komponen | Versi / Catatan |
| --- | --- |
| Runtime | Bun (lockfile: `bun.lock` ✅) |
| Framework | React 19 + Vite 6.4.2 |
| Routing | TanStack Router ~1.88 |
| Server state | TanStack Query ~5.62 |
| Client state | Zustand ~5.0 |
| UI | shadcn/ui + Radix + Tailwind v4 alpha |
| Auth UI | CASL + cookie bearer token |
| Maps | Leaflet + React-Leaflet |
| Rich text | Tiptap 3.x |
| Heavy libs | Handsontable, Three.js, ONNX (bg removal), Tesseract |

### Backend (`C:\laragon\www\apiamis`)

| Komponen | Catatan |
| --- | --- |
| Framework | Laravel |
| Auth | Sanctum (Bearer token) |
| RBAC | Spatie roles/permissions |
| API routes | ~153 deklarasi di `routes/api.php` |
| Controllers | ~50 controller aktif |

### Environment

- API base URL aktual: `VITE_API_BASE_URL` (fallback `https://apiamis.test/api`)
- ⚠️ Docs lama masih menyebut `VITE_API_URL` — **sudah tidak dipakai**
- HTTP client aktual: `fetch` via `src/lib/api-client.ts` — **bukan Axios**

---

## 3. Arsitektur

```text
User
  → TanStack Router (106 route files)
    → Feature component (src/features/*)
      → Feature API module (44 file api)
        → api-client.ts (fetch + Bearer)
          → APIAMIS Laravel
            → Controller → Model → Resource
```

### Lapisan yang sehat

- **Feature-first** dengan 41 modul domain di `src/features/`
- **Route terpisah** dari logic (`src/routes/` hanya komposisi layout)
- **API terpusat** — 55+ file mengimpor `@/lib/api-client`
- **Auth gate** di `_authenticated.tsx` (cookie token + role check)
- **Menu permission** + **route permission** (CASL) sebagai lapisan UI

### Inkonsistensi arsitektur

| Pola | Jumlah file (perkiraan) | Catatan |
| --- | --- | --- |
| TanStack Query (`useQuery`/`useMutation`) | ~40 komponen | Fitur baru & kompleks |
| Manual `useEffect` + `useState` fetch | ~55+ komponen | Fitur lama (CRUD list/form) |
| Direct `fetch` di luar api-client | 7 file | `geo-utils`, `openrouter`, `ElevationService`, dll. |

**Risiko:** Duplikasi loading/error handling, cache tidak konsisten, sulit di-test.

---

## 4. Inventori Fitur

### Modul frontend (41)

| Fitur | API | Test | Prioritas bisnis |
| --- | --- | --- | --- |
| pekerjaan | ✅ | ❌ | 🔴 Pusat domain |
| kontrak | ✅ | ❌ | 🔴 |
| berkas | ✅ | ✅ | 🔴 |
| foto | ✅ | ✅ | 🔴 |
| progress | ✅ | ✅ | 🔴 |
| spam-unit | ✅ | ❌ | 🟡 Baru (v0.4) |
| publikasi | ✅ | ❌ | 🟡 |
| dashboard | ✅ | ❌ | 🟡 |
| chat (AI) | ✅ | ❌ | 🟡 |
| simulation | ✅ | ❌ | 🟡 (chunk 1.8 MB) |
| puspen (tools) | ✅ | ❌ | 🟡 |
| users/roles/permissions | ✅ | ❌ | 🟡 Admin |
| route-permissions | ✅ | ❌ | 🟡 Admin |
| menu-permissions | ✅ | ❌ | 🟡 Admin |
| map | ❌ | ❌ | 🟢 (geo lokal) |
| profile | ❌ | ❌ | 🟢 |
| rab-analyzer | ❌ | ❌ | 🟢 (pakai api pekerjaan) |
| master-fase | ❌* | ❌ | 🟢 (*via progress/api) |

### Route publik (non-auth)

- `/` landing
- `/sign-in`, `/oauth-callback`
- `/publikasi/:slug`
- `/puspen/*`, `/tools/*` (PDF tools, media sharing)
- `/unauthorized`

### Fitur yang sudah dihapus (bersih)

Per `CONTINUITY.md`, sudah di-cleanup di frontend & backend:
- `SpamTerbangunRaw`
- `SpmAirMinum`
- `SpamKelembagaan`

---

## 5. Authorization — 4 Lapisan

```text
1. Route gate (_authenticated.tsx)
   └── Cookie token wajib ada

2. Role gate (_authenticated.tsx)
   └── Role 'user' saja → redirect /unauthorized

3. Menu permission (sidebar)
   └── menu-permission-store + canAccessMenu(menuKey)

4. Route permission (CASL)
   └── route-permission-context + defineAbilityFor()
   └── Default: allow all, lalu restrict per rule DB
```

### Titik rawan

| # | Risiko | Severity |
| --- | --- | --- |
| 1 | Token disimpan di cookie client-side (`thisisjustarandomstring`) — bukan HttpOnly | 🟡 Medium |
| 2 | CASL default `can('manage', 'all')` — bergantung pada rule DB lengkap | 🟡 Medium |
| 3 | Auth check frontend ≠ auth final backend — UI bisa misleading jika rule tidak sinkron | 🟡 Medium |
| 4 | Impersonation ada di auth store — perlu audit trail ketat | 🟡 Medium |

---

## 6. Integrasi API

### Frontend → Backend mapping

| Frontend API module | Backend controller |
| --- | --- |
| pekerjaan/api/* | PekerjaanController, DraftPekerjaanController, TagController |
| kontrak/api | KontrakController, KontrakAddendumController |
| berkas/api, foto/api | BerkasController, FotoController |
| progress/api | ProgressController, MasterFasePekerjaanController |
| spam-unit/api | SpamUnitController |
| publikasi/api | BlogController |
| chat/api | ChatController |
| simulation/api | SimulationNetworkController |
| puspen/api/* | PuspenMediaShareController, ToolPdfController, dll. |
| notifications/api | NotificationController |
| settings/api | AppSettingController |
| audit-logs/api | AuditLogController |
| error-logs/api | ClientErrorReportController |

### Kontrak response

- Backend **tidak seragam** — ada Laravel Resource collection bawaan, ada wrapper manual `{ data, meta }`
- Frontend harus cek per-endpoint, jangan asumsi shape generik
- Contoh mismatch historis: field `nama_kecamatan` vs `n_kec` (sudah di-handle di spam-unit)

### Bypass api-client (perlu review)

```
src/lib/geo-utils.ts
src/features/map/components/MapPage.tsx
src/features/search/api/openrouter.ts
src/features/simulation/services/ElevationService.ts
src/features/puspen/components/PuspenMediaSharingPublicPage.tsx
src/features/settings/constants/ai-providers.ts
```

---

## 7. Kualitas Kode & CI

### Build (`bun run build`) — ✅ Lulus

Durasi: ~1m 36s, 5703 modul.

**Warning chunk besar:**

| Chunk | Size (gzip) |
| --- | --- |
| `index-NTHWgg-r.js` (main) | **1,863 kB** |
| `NetworkEditorPage` | 511 kB |
| `vendor-pdf` | 176 kB |
| `vendor-xlsx` | 142 kB |
| WASM ort (AI bg removal) | 5,662 kB raw |

**Dynamic import warning:** `api-client.ts`, `Grainient.tsx`, dan 18 file user-guide di-import static + dynamic sekaligus.

### Lint (`bun run lint`) — ⚠️

- 0 errors, 22 warnings (semua `react-hooks/exhaustive-deps` atau `react-refresh`)
- Hotspot: `pekerjaan/*`, `kontrak/*`, `tiket/*`
- Script `bun run lint` kadang exit code 9 (kemungkinan OOM di environment Windows) — `bun x eslint .` langsung lulus

### Test (`bun run test -- --run`) — ⚠️

| Metrik | Nilai |
| --- | --- |
| Test files | 12 |
| Tests passed | 75/75 |
| Coverage area | berkas, foto, progress, lib utils, stores, 2 UI |
| Fitur dengan test | **3 dari 41** (~7%) |
| Unhandled error | Vitest worker exit unexpectedly |

**Gap test kritis (tanpa test sama sekali):**
- `pekerjaan` (domain pusat)
- `kontrak`, `auth`, `users/roles`
- `spam-unit` (fitur baru)
- `route-permissions`, `menu-permissions`

---

## 8. TypeScript & Technical Debt

| Indikator | Temuan |
| --- | --- |
| `any` / `as any` | ~90+ occurrences di `src/` |
| Hotspot `any` | `ProgressTabContent`, `pdf-generator`, `SpamUnitPage`, `KontrakList`, `routeTree.gen.ts` |
| Pola state lama | Banyak list page masih manual fetch |
| Handsontable | Masih di bundle meski beberapa halaman sudah migrasi ke Shadcn Table |
| CONTINUITY.md | Menyebut Next.js — **stale**, project ini Vite/React |

---

## 9. Performa & UX

### First load

- Main JS bundle ~6 MB → first paint lambat di koneksi biasa
- GeoJSON Cianjur ~3 MB embedded
- PDF worker ~1.4 MB
- ONNX WASM ~24 MB (lazy, tapi berat saat fitur bg-removal dipakai)

### Sudah ada mitigasi

- `manualChunks` di `vite.config.ts` untuk vendor split
- `lazyImport` wrapper dengan auto-reload untuk chunk error
- Lazy route untuk beberapa tab pekerjaan (`FotoTabContent`, `ProgressTabContent`)

### Belum ada

- Route-level code splitting untuk `simulation`, `map`, `chat`
- Preload strategy untuk domain inti
- Service worker / offline (tidak diperlukan kecuali ada requirement)

---

## 10. Keamanan

| Check | Status |
| --- | --- |
| Bearer token di header | ✅ |
| Input validation (Zod + RHF) | ✅ di form utama |
| XSS — React default escaping | ✅ |
| CSRF | N/A (API token-based) |
| Token storage | ⚠️ Cookie non-HttpOnly |
| Secrets di frontend | ⚠️ OpenRouter key via settings — pastikan tidak hardcode |
| File upload | ✅ FormData via api-client |
| Error reporting | ✅ `client-error-reporting.ts` ke backend |

---

## 11. Dokumentasi

| Dokumen | Akurasi |
| --- | --- |
| `.agent/README.md` | ✅ Akurat |
| `.agent/ARCHITECTURE.md` | ✅ Akurat |
| `.agent/SYSTEM_OVERVIEW.md` | ✅ Akurat |
| `.agent/rules.md` | ✅ Pedoman, verifikasi ke kode |
| `.agent/DOCUMENTATION_AUDIT.md` | ✅ Masih valid |
| `CONTINUITY.md` | ⚠️ Sebagian stale (Next.js claim) |
| `docs/user-guide/*` | ✅ Terintegrasi ke `/panduan` |
| README root | ⚠️ Perlu cek env var naming |

---

## 12. Rekomendasi (Prioritas)

### P0 — Sebelum fitur besar baru

1. **Standarkan data fetching** — migrasi bertahap list/form lama ke TanStack Query hooks per feature
2. **Tambah test untuk `pekerjaan`** — minimal API module + 1 komponen kritikal (list/detail)
3. **Perbaiki Vitest worker crash** — isolasi pool atau tingkatkan memory limit

### P1 — Kualitas & maintainability

4. **Code-split domain berat** — `simulation`, `chat`, `map`, `rab-analyzer` sebagai lazy routes
5. **Kurangi `any`** — mulai dari `pekerjaan`, `kontrak`, `progress` types
6. **Update CONTINUITY.md** — hapus referensi Next.js, tambahkan status Vite/React
7. **Audit route-permissions vs route aktual** — pastikan 106 route punya rule yang benar

### P2 — Optimasi & hardening

8. **Review token storage** — evaluasi HttpOnly cookie via backend atau short-lived token
9. **Hapus Handsontable** dari bundle jika tidak ada halaman aktif yang memakai
10. **GeoJSON** — load on-demand per kecamatan, bukan bundle global
11. **ESLint warnings** — fix `exhaustive-deps` di pekerjaan/kontrak (risiko stale data)

---

## 13. Checklist Verifikasi Cepat

```bash
# Frontend
cd C:\laragon\www\bun
bun run build      # harus lulus
bun x eslint .     # 0 errors
bun run test -- --run  # 75 passed, investigasi worker error

# Backend (jika perlu kontrak API)
cd C:\laragon\www\apiamis
php artisan route:list --path=api
```

---

## 14. Domain Sentral — Pekerjaan

Perubahan di sini berdampak ke 8+ fitur turunan:

```text
pekerjaan
├── kontrak (tab)
├── berkas (tab)
├── foto (tab)
├── output (tab)
├── penerima (tab)
├── progress (tab + halaman terpisah)
├── pengawas (assignment)
├── checklist
├── draft-pekerjaan
└── register dokumen
```

**Sebelum mengubah pekerjaan:** cek list, detail, form, dan semua tab sekaligus.

---

*Audit ini berdasarkan inspeksi kode aktual, bukan dokumentasi lama. Perbarui setelah perubahan arsitektur signifikan.*