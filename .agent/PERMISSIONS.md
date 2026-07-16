# Matriks Permission (ringkas)

Otorisasi final ada di **backend APIAMIS**. Frontend (CASL / menuKey / route gate) hanya untuk UX.

Lapisan:

1. **Session** (cookie BFF → Sanctum)
2. **Role** (`admin`, `operator`, `pengawas`, `konsultan_pengawas`, …)
3. **Route permission** (DB rules; default allow jika tidak ada rule)
4. **Menu permission** (`menuKey` di sidebar)
5. **Query scope** (`Pekerjaan::byUserRole()` dll.)
6. **Domain authorizer** (contoh OnlyOffice)

---

## Role (orientasi)

| Role | Akses data pekerjaan | UI admin | Catatan |
|---|---|---|---|
| `admin` | Semua | Ya | Bypass CASL manage-all |
| `operator` | Luas / hampir semua | Sebagian | Edit OnlyOffice diizinkan |
| `pengawas` / `konsultan_pengawas` | Scope assign | Terbatas | Buat laporan, foto, tiket |
| user lain | Sesuai menu + rule | Tidak | |

Cek role di BE: `$user->hasRole('…')`.  
Cek role di FE: `auth.user.roles` (string atau `{ name }`).

---

## Endpoint / fitur sensitif

| Area | Gate tipikal | Siapa |
|---|---|---|
| App settings, mail/kontrak templates | `role:admin` | admin |
| Broadcast notifikasi | `role:admin` | admin |
| WhatsApp bridge API | `role:admin` | admin |
| Backup restore | `role:admin` | admin |
| Route permission sync | `role:admin` | admin |
| Impersonate | `role:admin` | admin |
| OnlyOffice **view** | `canAccess` media | admin + yang punya akses pekerjaan/drive |
| OnlyOffice **edit** | `canEdit` media | admin, operator, pengawas (scope), owner drive |
| Pekerjaan list/detail | auth + `byUserRole` | sesuai assign |
| SPSE procurement | auth (session user) | operator/admin praktis |
| Data quality / action inbox | auth | admin/operator (disarankan) |
| Register dokumen | auth + akses pekerjaan | admin/operator |
| Tiket | auth; user lihat milik; admin kelola | |

---

## Sidebar `menuKey`

File: `src/components/layout/data/sidebar-data.ts`.

| menuKey | Contoh route | Arti UX |
|---|---|---|
| `dashboard` | `/dashboard`, `/action-inbox`, `/data-quality` | Dashboard & inbox |
| `pekerjaan` | `/pekerjaan`, `/rka` (jika ada), SIPD, RAB | Domain proyek |
| `kontrak` | `/kontrak`, addendum | Kontrak |
| `berkas` | `/berkas` | Drive / media |
| `tiket` | `/tiket` | Helpdesk internal |
| `settings` | `/settings`, Instagram | Konfigurasi |
| `broadcast_notification` | broadcast, WhatsApp | Notifikasi massal |
| `users` / `roles` / `permissions` | admin IAM | |

Menu disembunyikan jika menu permission user tidak punya key — **bukan** pengganti middleware API.

---

## Checklist fitur baru berizin

- [ ] Endpoint BE punya middleware / policy / scope yang benar?
- [ ] UI menyembunyikan aksi untuk role tanpa akses (tapi BE tetap menolak)?
- [ ] Documented di tabel di atas jika sensitif?
- [ ] Route permission DB perlu rule baru? (opsional)

Backend path: `C:\laragon\www\apiamis\routes\api.php`.
