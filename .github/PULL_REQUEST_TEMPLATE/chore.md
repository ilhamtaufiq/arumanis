## Chore / tooling / CI / Docker

<!-- Infra, dependensi, script, docs internal — bukan fitur user -->

**Alasan**

**Perubahan file utama**

-
-

## Risiko deploy

- [ ] Tidak mengubah runtime production
- [ ] Mengubah Dockerfile / Coolify build
- [ ] Mengubah env yang wajib di-set

## Checklist

- [ ] Coolify/local build diverifikasi bila Dockerfile disentuh
- [ ] Tidak ada secret baru di image layer
