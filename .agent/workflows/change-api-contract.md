---
description: Safely change an API request or response used by the frontend
---

# Change API Contract Workflow

## 1. Inventarisasi dampak

- Endpoint backend
- Resource serializer
- Frontend api module
- TypeScript type
- Halaman atau komponen konsumen

## 2. Pilih strategi

- additive change jika memungkinkan
- breaking change hanya jika benar-benar perlu
- untuk breaking change, ubah frontend dan backend bersama-sama

## 3. Implementasi

- Ubah backend lebih dulu
- Perbarui Resource dan test
- Perbarui frontend api function dan type
- Perbarui UI yang membaca field tersebut

## 4. Verifikasi

- shape response aktual cocok dengan type
- loading/error state tetap benar
- pagination/collection wrapper tidak berubah tanpa sengaja
- role dan permission tetap berlaku

