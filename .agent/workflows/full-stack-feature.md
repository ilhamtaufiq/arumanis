---
description: Add a feature that spans Arumanis frontend and APIAMIS backend
---

# Full-Stack Feature Workflow

Gunakan workflow ini bila satu perubahan menyentuh frontend dan backend sekaligus.

## 1. Pahami kebutuhan

- Tulis user flow singkat.
- Tentukan domain utamanya.
- Cari fitur paling mirip yang sudah ada di kedua repo.

## 2. Mulai dari backend contract

- Cek `routes/api.php`
- Cek controller, model, resource, dan migration terkait
- Tentukan:
  - endpoint
  - payload masuk
  - bentuk response
  - auth/permission

## 3. Implementasikan backend

- Tambah/ubah route
- Tambah validasi
- Ubah model/service seperlunya
- Gunakan Resource untuk response
- Tambahkan test bila endpoint kritis

## 4. Sambungkan frontend

- Tambah/ubah `src/features/<feature>/api`
- Perbarui type
- Ubah komponen dan route terkait
- Tangani loading, empty, error, dan unauthorized state

## 5. Verifikasi lintas repo

- Backend: test endpoint dan serializer
- Frontend: lint/build/test relevan
- Manual flow: create/read/update/delete atau flow inti fitur
- Cek role berbeda jika fitur dipengaruhi permission

## 6. Jangan lupa

- Bila response berubah, update dua sisi dalam satu rangkaian kerja.
- Bila backend perlu migration, catat dampaknya ke data lama.
- Bila ada docs lama yang tidak lagi cocok, perbarui docs agent.

