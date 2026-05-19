---
description: Debug a frontend/backend API issue without guessing the contract
---

# Debug Endpoint Workflow

## 1. Reproduksi masalah

- Catat route halaman frontend
- Catat endpoint yang dipanggil
- Catat status code dan payload aktual

## 2. Telusuri dari frontend ke backend

1. `src/features/<feature>/api`
2. type yang dipakai UI
3. `src/lib/api-client.ts`
4. `routes/api.php`
5. controller
6. resource/model

## 3. Klasifikasikan sumber masalah

- request salah
- auth/permission
- validation
- query/filter
- serializer/resource
- asumsi UI yang keliru

## 4. Perbaiki di lapisan yang tepat

- Jangan memperbaiki serializer dengan hack di UI bila kontraknya salah di backend.
- Jangan mengubah backend bila UI hanya mengirim field yang keliru.

## 5. Verifikasi

- endpoint langsung
- halaman frontend terdampak
- minimal satu kasus negatif

