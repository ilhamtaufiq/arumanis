# DESAIN.md - PUSPEN ARUMANIS

UI Design System - Tailwind CSS Neobrutalism + 8bit Visual

## 1. Konsep Desain

PUSPEN ARUMANIS adalah pusat penerangan Arumanis yang dipakai sebagai workspace mandiri. Karakternya neobrutalism, lalu dikasih sentuhan 8bit biar terasa tegas, retro, dan tetap enak dipakai kerja.

Karakter utama:

- tegas, kontras, dan berani
- border hitam tebal
- shadow keras tanpa blur
- bentuk kotak yang terasa seperti UI game retro
- panel pixel, label arcade, dan detail berpola grid
- typography berat, padat, dan mudah dibaca
- playful, tapi tetap fungsional buat kerja serius

## 2. Arah Visual

Gabungan visual yang dipakai:

- Neobrutalism untuk struktur utama
- 8bit untuk aksen, badge, panel, dan micro-detail
- gunakan grid pixel, stripe, dan checker pattern secara ringan
- hindari bentuk rounded yang lembek
- hindari efek glossy, glassmorphism, atau blur halus

## 3. Palet Warna

- `background`: `#FFF7E8`
- `foreground`: `#111111`
- `primary`: `#FFB703`
- `secondary`: `#8ECAE6`
- `accent`: `#FB8500`
- `success`: `#2ECC71`
- `danger`: `#EF233C`
- `muted`: `#E5E5E5`
- `paper`: `#FFFFFF`
- `black`: `#111111`
- `white`: `#FFFFFF`

## 4. Prinsip Tailwind

Standar utility untuk PUSPEN ARUMANIS:

- `border-[3px] border-[#111111]`
- `shadow-[6px_6px_0_0_#111111]`
- `font-black` atau `font-bold`
- `uppercase tracking-[0.18em]` untuk label penting
- `bg-[#FFF7E8]`, `bg-[#FFB703]`, `bg-[#8ECAE6]`, `bg-[#FB8500]`, `bg-[#2ECC71]`, `bg-[#EF233C]`, `bg-[#E5E5E5]`
- pattern pixel ringan boleh dipakai pada panel, hero, dan badge
- hindari gradient mewah; kalau perlu, cukup pattern 8bit berupa stripe atau checker

## 5. Base Style

- Background halaman: `#FFF7E8`
- Teks utama: `#111111`
- Font: tebal, jelas, dan padat
- Gunakan panel putih untuk konten utama, lalu beri aksen warna solid

## 6. Button

Primary button:

```html
<button class="bg-[#FFB703] border-[3px] border-[#111111] shadow-[6px_6px_0_0_#111111] px-5 py-3 font-black text-[#111111] transition active:translate-x-[3px] active:translate-y-[3px] active:shadow-none">
  Simpan Data
</button>
```

Pixel label button:

```html
<button class="border-[3px] border-[#111111] bg-[#8ECAE6] px-4 py-2 text-xs font-black uppercase tracking-[0.22em] shadow-[3px_3px_0_0_#111111]">
  100%
</button>
```

Danger button:

```html
<button class="bg-[#EF233C] border-[3px] border-[#111111] shadow-[6px_6px_0_0_#111111] px-5 py-3 font-black text-[#FFFFFF] transition active:translate-x-[3px] active:translate-y-[3px] active:shadow-none">
  Hapus
</button>
```

## 7. Card

```html
<div class="bg-[#FFFFFF] border-[3px] border-[#111111] shadow-[6px_6px_0_0_#111111] p-5">
  <h3 class="text-xl font-black mb-2">Judul Card</h3>
  <p class="text-sm font-bold">Isi card dengan gaya neobrutalism + 8bit.</p>
</div>
```

Tambahkan aksen 8bit pada header card atau badge status:

```html
<div class="border-b-[3px] border-[#111111] bg-[#FFB703] px-4 py-3">
  <div class="text-xs font-black uppercase tracking-[0.22em]">Ready</div>
</div>
```

## 8. Input

```html
<input
  type="text"
  placeholder="Masukkan nama"
  class="w-full bg-[#FFFFFF] border-[3px] border-[#111111] px-4 py-3 font-black outline-none focus:bg-[#8ECAE6]"
/>
```

## 9. Badge

```html
<span class="inline-block bg-[#2ECC71] border-[3px] border-[#111111] px-3 py-1 text-sm font-black uppercase tracking-[0.18em]">
  Aktif
</span>
```

## 10. Layout Page

```html
<main class="min-h-screen bg-[#FFF7E8] p-6">
  <section class="max-w-5xl mx-auto space-y-6">
    <div class="relative overflow-hidden border-[3px] border-[#111111] bg-[#FFB703] p-8 shadow-[6px_6px_0_0_#111111]">
      <div class="absolute inset-x-0 top-0 h-3 bg-[#111111]"></div>
      <h1 class="text-4xl font-black uppercase">Puspen Arumanis</h1>
      <p class="mt-2 max-w-2xl font-bold">
        Pusat penerangan Arumanis buat bantu SOP pekerjaan, dengan rasa neobrutalism dan aksen 8bit.
      </p>
    </div>
  </section>
</main>
```

## 11. Pola Visual 8bit

Gunakan pola ini secara ringan:

- checkerboard untuk preview transparansi
- stripe horizontal pada hero strip
- pixel grid pada panel status
- border blocky tanpa radius besar

## 12. Aturan Konsistensi

- Semua komponen utama memakai border hitam tebal
- Shadow harus keras dan tegas
- Gunakan warna solid
- Gunakan font black/bold
- Hover cukup sederhana: geser sedikit atau ubah warna
- Jangan gunakan shadow blur lembut
- Jangan terlalu banyak warna dalam satu halaman
- Hindari layout yang terlalu rounded
- Tambahkan detail pixel secukupnya, jangan sampai mengganggu keterbacaan

## 13. Arah Implementasi

PUSPEN ARUMANIS diperlakukan sebagai feature terpisah:

- Route sendiri
- Layout sendiri
- Komponen sendiri
- Tidak bergantung pada sidebar shell utama
- Tidak memakai shadcn/ui untuk UI inti Puspen
