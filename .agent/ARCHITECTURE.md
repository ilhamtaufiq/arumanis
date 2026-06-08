# Frontend Architecture Notes

## Gambaran singkat

Frontend ini memakai arsitektur **feature-first** di atas React/Vite. Route didefinisikan secara file-based oleh TanStack Router, sedangkan domain logic dan komponen UI berada di `src/features`.

## Alur request tipikal

```text
Route
  -> Feature component
    -> feature api module
      -> src/lib/api-client.ts
        -> APIAMIS Laravel backend
```

## Lapisan utama

| Lapisan | Lokasi | Tanggung jawab |
| --- | --- | --- |
| Routing | `src/routes` | URL, auth gate, page composition |
| Feature UI | `src/features/*/components` | layar dan interaksi domain |
| Feature API | `src/features/*/api` | request ke endpoint backend |
| Shared UI | `src/components` | komponen reusable dan layout |
| Shared state | `src/stores` | auth dan state global |
| Shared utilities | `src/lib`, `src/hooks` | utilitas lintas fitur |

## Domain yang paling terhubung

`pekerjaan` adalah pusat relasi aplikasi. Perubahan pada pekerjaan sering berdampak ke:

- `kontrak`
- `berkas`
- `foto`
- `output`
- `penerima`
- `progress`
- `pengawas`
- `checklist`

Untuk perubahan besar di domain ini, biasakan mengecek UI list, detail, form, dan tab turunannya sekaligus.

## Auth dan akses

- Route authenticated dijaga di `src/routes/_authenticated.tsx`.
- Token diambil dari cookie/store dan dikirim lewat bearer token oleh `api-client`.
- Otorisasi tampilan memakai CASL, tetapi keputusan akhir akses tetap harus dihormati dari backend.

## Data dan rendering

- Data remote sebaiknya dikelola sebagai server state.
- Empty/loading/error state adalah bagian dari kontrak UX, bukan aksesori.
- Komponen tabel cenderung mengikuti pola Card + Header + Content yang sudah distandardkan di `.agent/rules.md`.

## Integrasi penting

- Peta dan geodata: Leaflet/React Leaflet
- Dokumen: preview PDF/Office, export, ZIP
- Rich text/publikasi: Tiptap + aset media
- Analitik: charting dan tabel berat

## Aturan perubahan arsitektur

- Tambah feature baru di `src/features/<nama>` dulu; jangan menaruh logika domain besar di `components/` global.
- Bila ada pola domain yang berulang, ekstrak setelah ada minimal dua pemakaian nyata.
- Bila API backend berubah, ubah type dan api module di feature terkait dalam commit yang sama.
- Hindari menambah library baru bila utilitas yang ada masih memadai.
