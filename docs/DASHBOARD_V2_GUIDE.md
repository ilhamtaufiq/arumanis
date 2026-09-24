# Panduan Pengembangan & Standar Layout Dashboard V2

Dokumen ini berisi panduan arsitektur, konvensi layout, dan langkah-langkah menambahkan menu/fitur baru pada **Dashboard V2** (`apps/admin-dashboard-v2`) agar tampilan dan struktur komponen tetap konsisten 100% dengan standar **tanstack-shadcn-admin-dashboard**.

---

## 1. Lokasi & Stack Teknologi

- **Lokasi Proyek**: `apps/admin-dashboard-v2`
- **Menjalankan Dev Server**: `bun run dev:v2` (berjalan di `http://localhost:3000`)
- **Build Server/Client**: `bun run build`
- **Stack**:
  - **Framework**: TanStack Start & TanStack Router (File-based routing)
  - **Styling**: Tailwind CSS v4 & Shadcn UI v4 Primitives
  - **Icons**: `lucide-react` & `simple-icons`
  - **State Management**: Zustand (Preferences, Theme Mode, Presets)
  - **Charts & Tables**: Recharts, `@tanstack/react-table` v9

---

## 2. Struktur Folder Utama

```text
apps/admin-dashboard-v2/src/
├── components/            # Shadcn UI primitives & shared components
│   └── ui/                # Card, Table, Badge, Button, Input, Command, Sidebar, dll.
├── config/                # Konfigurasi aplikasi (app-config.ts)
├── data/                  # Mock data (users, data.json)
├── lib/                   # Utility helpers, preferences, font registry
│   └── preferences/       # Preferences store & theme boot scripts
├── navigation/            # Data navigasi utama
│   └── sidebar/
│       └── sidebar-items.ts  # Config menu & submenu sidebar
└── routes/
    ├── __root.tsx         # Root document & providers wrapper
    └── (main)/
        └── dashboard/     # Rute & komponen dashboard
            ├── -components/
            │   ├── header/  # LayoutControls, SearchDialog, ThemeSwitcher, AccountSwitcher
            │   └── sidebar/ # AppSidebar, NavMain, NavUser, SupportCard
            ├── default/     # Default Overview Dashboard
            ├── analytics/   # Analytics Dashboard
            ├── crm/         # CRM Dashboard
            ├── finance/     # Finance Dashboard
            ├── kanban/      # Interactive Kanban Board
            ├── mail/        # Interactive Mail Client
            ├── chat/        # Interactive Chat Messenger
            └── file-manager/# Interactive File Manager
```

---

## 3. Langkah Menambahkan Menu & Halaman Baru

Untuk menambahkan fitur/menu baru di Dashboard V2 dengan konsisten, ikuti 3 langkah berikut:

### Langkah 1: Daftarkan Menu di `sidebar-items.ts`
Buka file `apps/admin-dashboard-v2/src/navigation/sidebar/sidebar-items.ts` dan tambahkan item menu pada `sidebarItems`:

```typescript
// Contoh menambahkan menu "Reports" di bawah kelompok "Dashboards"
{
  id: "reports",
  title: "Reports",
  url: "/dashboard/reports",
  icon: FileTextIcon,
  badge: "new", // opsional: "new" | "soon"
}
```

### Langkah 2: Buat Rute Halaman
Buat file rute baru di `apps/admin-dashboard-v2/src/routes/(main)/dashboard/<nama-fitur>/route.tsx`:

```tsx
import { createFileRoute } from "@tanstack/react-router"
import { ReportsView } from "./-components/reports-view"

export const Route = createFileRoute("/(main)/dashboard/reports")({
  component: ReportsView,
})
```

### Langkah 3: Buat Komponen Halaman Sesuai Standar Layout
Buat folder `-components` di dalam folder fitur tersebut: `apps/admin-dashboard-v2/src/routes/(main)/dashboard/<nama-fitur>/-components/reports-view.tsx`

---

## 4. Standar Layout Komponen Halaman

Setiap halaman baru **WAJIB** mengikuti struktur visual dan komponen berikut agar seragam:

### A. Header Halaman (Page Title & Action Buttons)
```tsx
<div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
  <div className="flex flex-col gap-1">
    <h1 className="text-3xl leading-none tracking-tight">Judul Fitur</h1>
    <p className="text-muted-foreground text-sm">Deskripsi singkat fungsi halaman ini.</p>
  </div>
  <div className="flex items-center gap-2">
    <Button variant="outline">
      <Download data-icon="inline-start" />
      Export
    </Button>
    <Button>
      <Plus data-icon="inline-start" />
      Tambah Data
    </Button>
  </div>
</div>
```

### B. Metric KPI Cards (Format Card 4 Kolom)
```tsx
<div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
  <Card>
    <CardHeader>
      <CardTitle>
        <div className="flex size-7 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
          <Icon className="size-4" />
        </div>
      </CardTitle>
      <CardDescription>Nama Metric</CardDescription>
    </CardHeader>
    <CardContent className="flex flex-col gap-1">
      <div className="flex flex-wrap items-center gap-2">
        <div className="font-medium text-3xl tabular-nums leading-none tracking-tight">1,250</div>
        <Badge>+12.5%</Badge>
      </div>
      <p className="text-muted-foreground text-sm">Keterangan tren</p>
    </CardContent>
  </Card>
</div>
```

### C. Filtering & Data Table
```tsx
<div className="space-y-4">
  {/* Toolbar Search & Filter */}
  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
    <div className="relative w-full lg:w-80">
      <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input className="h-8 pl-8" placeholder="Search data..." />
    </div>
  </div>

  {/* Table Box Container */}
  <div className="overflow-hidden rounded-lg border bg-card">
    <Table>
      <TableHeader className="bg-muted/15">
        <TableRow>
          <TableHead>Nama</TableHead>
          <TableHead>Kategori</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {/* Render baris data */}
      </TableBody>
    </Table>
  </div>
</div>
```

---

## 5. Fitur Preferences & Pengaturan Layout (Header Controls)

Header bawaan di Dashboard V2 menyertakan kontrol interaktif yang tersinkronisasi via `PreferencesStoreProvider`:
- **Theme Mode**: Light / Dark / System Mode.
- **Theme Preset**: Pilihan skema warna (*Default Blue, Slate, Emerald, Rose, Amber*).
- **Page Layout**: `centered` (max width container) vs `full-width`.
- **Navbar Behavior**: `sticky` (tetap melayang saat scroll) vs `scroll`.
- **Sidebar Style**: `inset` (melayang di dalam container), `sidebar`, atau `floating`.
- **Collapse Mode**: `icon` (hanya ikon) vs `offcanvas` (sembunyi penuh).

Dokumen ini wajib dijadikan referensi sebelum menambah rute/komponen baru di `apps/admin-dashboard-v2`.
