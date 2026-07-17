**ARUMANIS** (Air Minum & Sanitasi Cianjur) adalah sistem informasi untuk merencanakan, melaksanakan, mendokumentasikan, dan memantau program air minum & sanitasi.

Dokumentasi ini memakai **Fumadocs** di path `/docs` (bukan Docsify lama).

## Dua permukaan aplikasi

| Aplikasi | URL | Siapa |
|----------|-----|--------|
| **Arumanis Utama** | `/` (setelah login â†’ dashboard) | Admin, operator, PPTK, viewer |
| **Panel Pengawasan** | `/pengawasan/` | Pengawas / konsultan pengawas (SSO) |
| **Puspen** | `/puspen` | Pusat pengendalian (KPI, progress, media) |

Semua memakai akun **APIAMIS** yang sama. Panel pengawas **tidak punya form login sendiri** â€” masuk lewat Arumanis.



## Mulai cepat

1. Buka aplikasi â†’ [Login](/docs/auth) di `/sign-in`
2. Pahami [navigasi global](/docs/navigasi-global) (sidebar, notifikasi, profil)
3. Sesuai peran:
   - **Admin/operator** â†’ [Dashboard](/docs/dashboard) â†’ [Pekerjaan](/docs/pekerjaan-output)
   - **Pengawas** â†’ otomatis diarahkan ke [Panel Pengawasan](/docs/pengawas-panel)
4. Unduh/preview dokumen â†’ [OnlyOffice](/docs/dokumen-onlyoffice)
5. Masalah? â†’ [Pemecahan masalah](/docs/pemecahan-masalah)

## Peta modul (sidebar)

### Inti operasional
| Modul | Path | Panduan |
|-------|------|---------|
| Dashboard | `/dashboard` | [dashboard](/docs/dashboard) |
| Kegiatan | `/kegiatan` | [kegiatan](/docs/kegiatan) |
| Pekerjaan & Output | `/pekerjaan`, `/output` | [pekerjaan-output](/docs/pekerjaan-output) |
| Kontrak | `/kontrak` | [kontrak](/docs/kontrak) |
| Penerima / Penyedia | `/penerima`, `/penyedia` | [penerima-penyedia](/docs/penerima-penyedia) |
| Berkas & Foto | `/berkas`, `/foto` | [berkas-foto](/docs/berkas-foto) |
| Preview dokumen | OnlyOffice | [dokumen-onlyoffice](/docs/dokumen-onlyoffice) |
| Checklist | `/checklist` | [checklist](/docs/checklist) |
| Tiket | `/tiket` | [tiket](/docs/tiket) |

### Integrasi & data
| Modul | Path | Panduan |
|-------|------|---------|
| SPSE / sinkron pengadaan | `/procurement-sync` | [spse-import](/docs/spse-import) |
| SPAM Unit | `/spam-unit` | [spam-unit](/docs/spam-unit) |
| SPM / capaian | `/spm-sanitasi`, capaian | [spm-capaian](/docs/spm-capaian) |
| Wilayah | `/desa`, `/kecamatan` | [desa-kecamatan](/docs/desa-kecamatan) |

### Kolaborasi
| Modul | Path | Panduan |
|-------|------|---------|
| WhatsApp | `/whatsapp` | [whatsapp](/docs/whatsapp) |
| Asisten AI | `/asisten-ai` | [asisten-ai](/docs/asisten-ai) |
| Puspen | `/puspen` | [puspen](/docs/puspen) |
| Panel Pengawasan | `/pengawasan/` | [pengawas-panel](/docs/pengawas-panel) |

### Administrasi
| Modul | Path | Panduan |
|-------|------|---------|
| Users / Roles | `/users`, `/roles` | [users](/docs/users), [roles](/docs/roles-permissions) |
| Akses menu | permission matrix | [manajemen-akses](/docs/manajemen-akses) |
| Settings & backup | `/settings` | [settings](/docs/settings) |

## Browser & dukungan

- **Browser:** Chrome, Edge, Firefox (versi terbaru)
- **Versi app:** lihat `CHANGELOG` / badge versi di footer jika ada
- **Bantuan di app:** menu **Panduan** mengarah ke `/docs`

## Konvensi di panduan ini

- Path URL ditulis seperti `/pekerjaan`
- Screenshot dari build terkini ada di beberapa halaman modul
- Fitur admin-only ditandai **Admin**
- Integrasi eksternal (SPSE, OnlyOffice, WhatsApp) punya halaman troubleshooting sendiri
