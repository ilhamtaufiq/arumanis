# Documentation Audit

Audit ini merangkum bagian dokumentasi yang akurat, bagian yang perlu dibaca dengan konteks, dan mismatch yang sudah diketahui.

## Masih akurat

- Gambaran stack utama frontend
- Struktur feature-first
- Penggunaan TanStack Router, Zustand, CASL, React Hook Form, dan Zod
- Pentingnya shared layout, auth, dan state management

## Perlu dibaca dengan konteks

| Dokumen / klaim | Catatan |
| --- | --- |
| README menyebut `VITE_API_URL` | Kode aktual di `src/lib/api-client.ts` memakai `VITE_API_BASE_URL`. |
| Contoh response API generik | Backend aktual tidak selalu memakai shape manual yang sama; beberapa endpoint memakai Laravel Resource collection bawaan. |
| Contoh fitur baru | Beberapa contoh memakai pola sederhana yang belum tentu sama dengan feature kompleks yang sudah ada. |
| Aturan layout halaman | Berguna sebagai standar visual, tetapi cek halaman sejenis terbaru sebelum menyalin mentah-mentah. |

## Mismatch yang perlu diingat agent

- HTTP client aktual berbasis `fetch`, bukan Axios.
- Sebagian dokumentasi lama lebih normatif daripada deskriptif.
- Fitur besar seperti `pekerjaan`, `foto`, `berkas`, dan `progress` memiliki integrasi lintas domain; jangan diperlakukan seperti CRUD sederhana.

## Cara memakai docs dengan benar

1. Mulai dari `README.md` dan `ARCHITECTURE.md` baru di `.agent`.
2. Gunakan `rules.md` sebagai pedoman, bukan pengganti inspeksi kode.
3. Bila ada keraguan, pilih implementasi fitur terdekat yang masih aktif sebagai referensi utama.

