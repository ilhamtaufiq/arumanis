# DESAIN.md — PUSPEN ARUMANIS

Design system: **Neobrutalism + Retro Arcade + 8bit Game UI**

---

## 1. Konsep

PUSPEN ARUMANIS adalah **command center** workflow Arumanis — workspace mandiri di luar dashboard utama. Visualnya seperti **menu game retro**: tegas, kontras, playful, tapi tetap dipakai untuk kerja serius.

Metafora UI:

| Elemen app | Metafora game |
|------------|---------------|
| Home `/puspen` | Title screen + level select |
| Status bar atas | HUD (player, status, exit) |
| Kartu alat | Tool slot / stage select |
| Workflow map | Route map antar stage |
| Mission panel | Quest log |
| Tombol aksi | `START`, `LOCK`, `EXIT` |
| Halaman alat | Gameplay screen |

Karakter visual:

- Border hitam tebal, shadow keras tanpa blur
- Bentuk kotak / pixel — hindari radius besar
- Warna solid, kontras tinggi
- Pattern grid, stripe, checker sebagai aksen 8bit
- Typography `font-black`, uppercase, tracking lebar
- Interaksi seperti tombol arcade: tekan = geser + shadow hilang

**Tidak dipakai:** glassmorphism, gradient mewah, shadcn/ui di inti Puspen, shadow blur lembut.

---

## 2. Palet Warna

| Token | Hex | Pemakaian |
|-------|-----|-----------|
| `background` | `#FFF7E8` | Latar halaman, kertas hangat |
| `foreground` | `#111111` | Teks, border |
| `primary` | `#FFB703` | Hero, CTA utama, highlight |
| `secondary` | `#8ECAE6` | Panel samping, slot PDF |
| `accent` | `#FB8500` | Media sharing, admin zone |
| `success` | `#2ECC71` | Online, progress, sukses |
| `danger` | `#EF233C` | Hapus, error, deviasi negatif |
| `muted` | `#E5E5E5` | Divider, disabled |
| `paper` | `#FFFFFF` | Kartu konten |
| `crt` | `#1A1A2E` | Status bar, label gelap, slot number |

### Mapping per alat

| Alat | Slot | Warna aksen |
|------|------|-------------|
| Kelola PDF | `01` | `#8ECAE6` |
| TTD PDF Digital | `02` | `#FFB703` |
| Progress Fisik | `03` | `#2ECC71` |
| Media Sharing | `04` | `#FB8500` |
| Statistik Input Data Pengawas | `05` | `#7C3AED` |
| Review Pekerjaan | `06` | `#E63946` |

---

## 3. Token Tailwind (referensi kode)

File: `src/features/puspen/lib/tokens.ts`

```ts
puspenBorder      → border-[3px] border-[#111111]
puspenShadowSm    → shadow-[2px_2px_0_0_#111111]
puspenShadowMd    → shadow-[3px_3px_0_0_#111111]
puspenShadowLg    → shadow-[6px_6px_0_0_#111111]
puspenPressable   → active:translate + active:shadow-none
puspenLabel       → text-[10px] font-black uppercase tracking-[0.22em]
```

---

## 4. Typography

- **Display / judul hero:** `text-4xl` → `text-7xl`, `font-black`, `uppercase`, `tracking-[0.08em]`+
- **Judul section:** `text-xl`–`text-2xl`, `font-black`, `uppercase`
- **Label HUD / badge:** `text-[10px]`, `font-black`, `uppercase`, `tracking-[0.18em]`–`0.34em`
- **Body:** `text-sm`–`text-base`, `font-bold`, `leading-6`–`7`
- **Angka slot:** `text-lg`, `font-black`, `tracking-[0.2em]` (01, 02, …)

Hindari font ringan (`font-normal`, `font-light`) di komponen utama.

---

## 5. Komponen

### 5.1 Button

**Primary (START):**
```
bg-[#FFB703] border-[3px] border-[#111111] shadow-[3px_3px_0_0_#111111]
px-5 py-3 font-black uppercase tracking-[0.18em]
active:translate-x-[3px] active:translate-y-[3px] active:shadow-none
```

**Secondary:**
```
bg-[#8ECAE6] … (sama struktur)
```

**Danger:**
```
bg-[#EF233C] text-white …
```

**Nav / Exit:**
```
bg-[#FFF7E8] hover:bg-[#FFB703] …
```

### 5.2 Tool Slot Card (Level Select)

Struktur:

1. **Slot badge** kiri atas (`01`–`06`) — bg `crt`, teks `primary`
2. **Header berwarna** — status `Ready` + tag (`Archive`, `Sign`, …)
3. **Body putih** — judul + deskripsi
4. **Aksi** — tombol `START` + opsi admin (`LOCK`/`UNLOCK`)

```
article: bg-white, border 3px, shadow 6px
hover group: icon box → bg primary
```

### 5.3 HUD Status Bar

Bar gelap (`crt`) di atas halaman hub:

- Kiri: badge Command Center + jumlah tools
- Kanan: nama player, status Online (dot ping), link Exit ke Arumanis

### 5.4 Hero (Title Screen)

- Background `primary`
- Stripe bawah (pattern horizontal)
- Judul dua baris: `Puspen` / `Arumanis`
- Prompt berkedip: `▶ Pilih Alat Untuk Mulai`

### 5.5 Workflow Map

Horizontal di desktop, stack di mobile. Tiap step = panel warna alat + icon + label `Step N`. Panah `→` antar step.

### 5.6 Mission Panel

Sidebar kanan hub:

- Header `Mission Log`
- Kartu M-01 … M-06 (quest singkat per alat)
- Admin zone (orange) jika role admin

### 5.7 Input

```
w-full bg-white border-[3px] border-[#111111] px-4 py-3 font-black
outline-none focus:bg-[#8ECAE6]
```

### 5.8 Badge / Chip

```
inline-block border-[3px] border-[#111111] px-2 py-1
text-[10px] font-black uppercase tracking-[0.16em] shadow-[2px_2px_0_0_#111111]
```

---

## 6. Layout

### 6.1 Hub Home (`/puspen`)

Komponen: `components/hub/*`

```
PuspenHubShell
├── PuspenHubStatusBar
└── content
    ├── PuspenHubHero
    └── grid 2 kolom (xl)
        ├── Tool Select (grid 2x2)
        ├── PuspenWorkflowMap
        └── PuspenMissionPanel
```

### 6.2 Halaman Alat

Pakai `PuspenToolLayout` — shell hub + status bar + hero berwarna (sesuai alat) + aside opsional.

Status bar alat (`PuspenToolStatusBar`):

- `← Hub` ke `/puspen`
- Badge slot (`01`–`06`) + nama alat
- `Exit` ke dashboard (non-publik)

Metadata alat terpusat di `lib/tool-meta.ts` (`PUSPEN_TOOLS`).

Halaman publik (media share token, progress fisik publik): `showHubBack={false}`, `showDashboardExit={false}`.

---

## 7. Pola Visual 8bit / Retro

| Pola | Pemakaian |
|------|-----------|
| Pixel grid background | Shell halaman (`24px` grid) |
| Scanline overlay | Opacity ~3% di hub shell |
| Checker / diagonal | Aksen background shell |
| Stripe horizontal | Hero bawah, mission header |
| Kotak pojok 4px | Dekorasi sudut shell |
| Slot number | Sudut kiri atas kartu alat |
| Blink prompt | `animate-pulse` pada CTA sekunder hero |

---

## 8. Motion & Interaksi

- **Press:** `active:translate-x/y-[2px–3px]` + `active:shadow-none`
- **Hover ringan:** ubah bg solid (bukan scale blur)
- **Status online:** `animate-ping` pada dot kecil
- **Prompt hero:** `animate-pulse` — jangan berlebihan di elemen lain

Tidak ada transition panjang atau spring halus — rasa arcade instan.

---

## 9. Ikonografi

- Lucide icons, stroke default
- Ukuran: `h-4 w-4` (badge), `h-5 w-5` (card), `h-6 w-6` (slot header)
- Icon selalu dalam kotak berborder — seperti tile inventory game

---

## 10. Aturan Konsistensi

1. Maksimal **satu** warna aksen kuat per kartu/seksi
2. Border selalu `#111111` tebal 3px pada elemen utama
3. Shadow selalu offset solid, tidak blur
4. Label penting selalu **UPPERCASE**
5. Hindari `rounded-xl` / `rounded-full` — pakai kotak atau radius minimal
6. Hub = game menu; tool pages = gameplay — bedakan density (hub lebih ringkas di hero)
7. Puspen **tidak** mengikuti redesign shadcn dashboard — sengaja terpisah

---

## 11. Akses & Copy

| Istilah UI | Arti |
|------------|------|
| START | Buka alat |
| EXIT ke Arumanis | Kembali ke dashboard |
| Mission Log | Panduan singkat per alat |
| Tool Select | Grid pemilihan alat |
| LOCK / UNLOCK | Toggle akses publik progress fisik (admin) |
| Ready | Alat siap dipakai |

---

## 12. Struktur File

```
src/features/puspen/
├── DESAIN.md
├── lib/
│   ├── tokens.ts
│   └── tool-meta.ts            ← PUSPEN_TOOLS (slot, warna, route)
├── components/
│   ├── hub/                    ← Home command center
│   │   ├── PuspenHubShell.tsx
│   │   ├── PuspenHubStatusBar.tsx
│   │   ├── PuspenHubHero.tsx
│   │   ├── PuspenToolStatusBar.tsx
│   │   ├── PuspenToolSlotCard.tsx
│   │   ├── PuspenWorkflowMap.tsx
│   │   └── PuspenMissionPanel.tsx
│   ├── PuspenToolLayout.tsx    ← Halaman alat
│   └── PuspenHomePage.tsx
└── api/
```

---

## 13. Checklist Implementasi Baru

Saat menambah komponen Puspen:

- [ ] Pakai token dari `lib/tokens.ts`
- [ ] Border 3px + shadow solid
- [ ] Label uppercase untuk status/nav
- [ ] Tombol ada state `active` press
- [ ] Warna aksen sesuai mapping alat
- [ ] Tidak import komponen shadcn untuk UI inti
- [ ] Link kembali ke `/puspen` jika di halaman alat