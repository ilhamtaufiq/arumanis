---
tags: [arumanis, session]
date: 2026-09-27
time: "17:02"
module: bun
status: done
agent: claude-code
files:
  - src/features/landing-v2/components/animated-sphere.tsx
  - src/features/landing-v2/components/animated-tetrahedron.tsx
  - src/features/landing-v2/components/animated-wave.tsx
  - src/features/landing-v2/landing-v2.css
  - src/features/settings/lib/maintenance.ts
  - src/routes/__root.tsx
  - src/routes/index.tsx
---

[[HQ-Dashboard|Kembali ke Dashboard]] · [[Arumanis - Log Pengembangan|Index Sesi]]

## Goal

Optimasi Performa Landing Page Canvas dan Eliminasi Network Blocking saat Akses Publik.

## Constraints/Assumptions

- Animasi canvas 3D (`AnimatedSphere`, `AnimatedTetrahedron`, `AnimatedWave`) tetap berjalan tanpa dihilangkan.
- Rute landing page `/` murni publik tanpa blocking network fetch.

## Keputusan & Perubahan

1. **Eliminasi Network Blocking pada Landing Page**:
   - Menghapus panggilan blocking `/bff/auth/me`, `/bff/api/app-settings/maintenance`, dan `/bff/api/app-settings` dari rute `/` (`src/routes/index.tsx`) dan root route (`src/routes/__root.tsx`).
   - Menambahkan rute `/` ke `isMaintenanceExemptPath` (`src/features/settings/lib/maintenance.ts`) agar bebas dari pembatasan status maintenance.

2. **Optimasi Rendering Canvas Animation 3D**:
   - Menambahkan `IntersectionObserver` pada `AnimatedSphere`, `AnimatedTetrahedron`, dan `AnimatedWave` agar animasi `requestAnimationFrame` otomatis pause saat canvas berada di luar viewport (0% CPU/GPU overhead).
   - Menambahkan `ResizeObserver` untuk menghindari layout thrashing / forced reflow dari `getBoundingClientRect()` di dalam loop 60fps.
   - Menambahkan guard check `width > 0 && height > 0` untuk mencegah exception saat mount.

3. **Optimasi CSS Overlay & GPU Rasterization**:
   - Mengubah blur animasi teks (`animate-char-in`) dari `40px` ke `8px` dengan properti `will-change` untuk mereduksi beban rasterization GPU.
   - Mengoptimasi SVG fractal noise overlay (`numOctaves` dari 4 ke 1) untuk mempercepat paint time saat scroll.

## Status (Done / Now / Next)

- **Done**: Optimasi komponen canvas, eliminasi network fetch blocking rute `/`, buat catatan sesi.
- **Now**: Commit dan push ke branch `dev`.
- **Next**: Verifikasi kecepatan render landing page di environment staging/production.

## Working Set (File yang disentuh)

  - src/features/landing-v2/components/animated-sphere.tsx
  - src/features/landing-v2/components/animated-tetrahedron.tsx
  - src/features/landing-v2/components/animated-wave.tsx
  - src/features/landing-v2/landing-v2.css
  - src/features/settings/lib/maintenance.ts
  - src/routes/__root.tsx
  - src/routes/index.tsx

