# Route Permissions

Dokumentasi tentang sistem route permission di ARUMANIS frontend.

## Overview

Sistem route permission menggunakan komponen `ProtectedRoute` untuk mengontrol akses halaman berdasarkan role user.

## Cara Penggunaan

### Menggunakan ProtectedRoute

```tsx
import { ProtectedRoute } from '@/components/ProtectedRoute';

export const Route = createFileRoute('/_authenticated/example/')({
  component: () => (
    <ProtectedRoute requiredPath="/example" requiredMethod="GET">
      <ExampleComponent />
    </ProtectedRoute>
  ),
});
```

### Props

| Prop | Type | Default | Keterangan |
|------|------|---------|------------|
| `requiredPath` | string | - | Path route yang diproteksi |
| `requiredMethod` | string | `'GET'` | HTTP method |
| `redirectTo` | string | `'/'` | Redirect jika akses ditolak |
| `children` | ReactNode | - | Komponen yang diproteksi |

## Admin Only Routes

Routes yang otomatis hanya bisa diakses admin:

```typescript
const ADMIN_ONLY_ROUTES = [
    '/kegiatan',
    '/desa',
    '/kecamatan',
    '/kontrak',
    '/output',
    '/penerima',
    '/users',
    '/roles',
    '/permissions',
    '/route-permissions',
    '/menu-permissions',
    '/kegiatan-role',
    '/berkas',
    '/settings',
];
```

## Cara Kerja

1. **Admin** → Selalu diizinkan
2. **Database Rule** → Jika ada rule, gunakan role dari database
3. **ADMIN_ONLY_ROUTES** → Jika route ada di list, tolak non-admin
4. **Default** → Izinkan akses

## Menambah Route Baru yang Admin-Only

Edit file `src/components/ProtectedRoute.tsx`:

```typescript
const ADMIN_ONLY_ROUTES = [
    // ... existing routes
    '/new-admin-only-route',
];
```

## Pattern Matching

`ProtectedRoute` mendukung pattern matching untuk dynamic routes:

- `/pekerjaan/:id` matches `/pekerjaan/123`
- `/users/:userId/edit` matches `/users/5/edit`

## Database Integration

Permission juga bisa dikonfigurasi melalui database. Lihat dokumentasi backend `ROUTE_PERMISSIONS.md` untuk detail.
