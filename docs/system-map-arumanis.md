# Peta Sistem Arumanis

**Satu data air minum & sanitasi Kabupaten Cianjur** — peta arsitektur dari portal, API, panel lapangan, hingga integrasi eksternal.

> Sumber: kode aktual + [integrasi-platform.md](./integrasi-platform.md), runbook SPSE / WhatsApp / Instagram, repo `apiamis`, `pengawas`, `arumanis-gis`.

---

## 1. Peta ekosistem (tinggi)

```mermaid
flowchart TB
  subgraph Users["Pengguna"]
    OP[Operator / Admin DPKP]
    PW[Pengawas & Konsultan]
    PUB[Publik / Masyarakat]
  end

  subgraph Clients["Klien aplikasi"]
    PORTAL["Portal Arumanis<br/>React + BFF Bun<br/>arumanis.cianjur.space"]
    PANEL["Panel Pengawasan Web<br/>/pengawasan<br/>React + BFF Bun"]
    MOBILE["Mobile Pengawasan<br/>Expo / React Native"]
    GIS["Lab GIS<br/>/gis<br/>MapLibre + BFF"]
  end

  subgraph Core["Inti platform"]
    BFF["BFF Arumanis<br/>Hono · cookie session"]
    API["APIAMIS Laravel<br/>apiamis.cianjur.space"]
    DB[(MySQL)]
    REDIS[(Redis · Queue · Cache)]
    REVERB[Laravel Reverb<br/>Realtime / Presence]
  end

  subgraph External["Integrasi eksternal"]
    SIPD["SIPD Lite<br/>FastAPI cache Renja"]
    SPSE["SPSE INAPROC<br/>LPSE Cianjur"]
    IG["Meta Instagram<br/>Graph API + Webhook"]
    WA["WhatsApp Bridge<br/>Baileys di APIAMIS"]
    OO[OnlyOffice]
    ODATA[OpenData Cianjur<br/>KK per desa]
    GDRIVE[Google Drive Backup]
  end

  OP --> PORTAL
  OP --> GIS
  PW --> PANEL
  PW --> MOBILE
  PW --> PORTAL
  PUB --> PORTAL

  PORTAL --> BFF
  BFF -->|/bff/api/* Bearer| API
  BFF -->|/bff/sipd/*| SIPD
  BFF -->|/bff/instagram/*| IG
  BFF -->|handoff SSO| PANEL
  BFF -->|handoff SSO| GIS

  PANEL -->|BFF pengawasan → Bearer| API
  MOBILE -->|Bearer langsung| API
  GIS -->|BFF GIS → Bearer| API

  API --> DB
  API --> REDIS
  API --> REVERB
  API -->|session cookie SPSE| SPSE
  API --> WA
  API --> OO
  API --> ODATA
  API --> GDRIVE

  PORTAL -.->|subscribe| REVERB
  PANEL -.->|subscribe| REVERB
  MOBILE -.->|subscribe| REVERB
```

---

## 2. Lapisan internal (portal + API)

```mermaid
flowchart LR
  subgraph FE["Portal Arumanis — www/bun"]
    R[TanStack Router<br/>src/routes]
    F[Feature UI<br/>src/features/*]
    A[Feature API]
    C[api-client.ts]
    R --> F --> A --> C
  end

  subgraph BFFLayer["BFF Bun — server/"]
    SESS[Session cookie<br/>arumanis_session httpOnly]
    PROXY["Proxy /bff/api/*"]
    SIPDP["Proxy /bff/sipd/*"]
    IGP["Instagram routes"]
    AUTH[Auth login / me / handoff]
    C --> SESS
    SESS --> PROXY
    SESS --> SIPDP
    SESS --> IGP
    SESS --> AUTH
  end

  subgraph BE["APIAMIS — Laravel"]
    RT[routes/api.php]
    MW[Sanctum + Role + Scope]
    CTL[Controllers / Services]
    RES[API Resources]
    MDL[(Models / MySQL)]
    PROXY -->|Authorization Bearer| RT
    RT --> MW --> CTL --> RES
    CTL --> MDL
  end
```

**Domain sentral di API & portal:** `pekerjaan` → kontrak, berkas, foto, output, penerima, progress, checklist, PUSPEN, user-pekerjaan.

---

## 3. Matriks klien & autentikasi

```mermaid
flowchart TB
  subgraph AuthPatterns["Pola auth"]
    direction TB
    A1["Portal web<br/>Cookie BFF → Bearer ke APIAMIS"]
    A2["Panel /pengawasan<br/>Cookie BFF sendiri → Bearer"]
    A3["Mobile<br/>SecureStore Bearer langsung ke APIAMIS"]
    A4["Lab GIS /gis<br/>Cookie gis_session + SSO handoff"]
  end

  AKUN["Satu akun APIAMIS<br/>Spatie roles + assignment"]
  AKUN --> A1 & A2 & A3 & A4
```

| Klien | Path / host | Sesi | Ke APIAMIS |
|-------|-------------|------|------------|
| Portal Arumanis | `/` | `arumanis_session` (BFF) | Bearer via BFF |
| Panel pengawasan | `/pengawasan` | cookie BFF pengawasan | Bearer via BFF |
| Mobile pengawas | APK Expo | SecureStore | Bearer langsung |
| Lab GIS | `/gis` | `gis_session` path `/gis` | Bearer via BFF GIS |
| SIPD (baca) | proxy BFF | sesi Arumanis + `SIPD_SERVICE_TOKEN` | tidak (ke SIPD Python) |
| SPSE | server-side | cookie `SPSE_SESSION` di APIAMIS | via service procurement |

---

## 4. Integrasi per sistem

### 4.1 SIPD (Renja / penganggaran)

```mermaid
sequenceDiagram
  participant U as Operator
  participant P as Portal /sipd-renja
  participant B as BFF /bff/sipd
  participant S as SIPD Lite FastAPI
  participant W as SIPD Web UI

  U->>W: Sync manual di SIPD Web (is_anggaran=1)
  W-->>S: Isi cache Renja / rincian
  U->>P: Buka Penganggaran SIPD
  P->>B: GET renja / rincian
  B->>B: Cek sesi Arumanis
  B->>S: Service token + cache API
  S-->>P: Data Renja (read-only)
  Note over P: Match/link ke kegiatan & pekerjaan di Arumanis<br/>Tidak menulis balik ke SIPD
```

| Arah | Isi |
|------|-----|
| SIPD → Arumanis | Cache Renja, rincian belanja (baca) |
| Arumanis → SIPD | Tidak (sync sumber di UI SIPD) |

---

### 4.2 SPSE (LPSE / pengadaan)

```mermaid
sequenceDiagram
  participant U as Operator
  participant SP as SPSE inaproc
  participant P as Portal /procurement-sync
  participant API as APIAMIS procurement
  participant K as Modul Kontrak

  U->>SP: Login + CAPTCHA
  U->>P: Bookmarklet / paste SPSE_SESSION
  P->>API: POST /session
  U->>P: Sync paket
  P->>API: POST /sync
  API->>SP: HTTP + cookie session
  SP-->>API: DataTables paket
  API-->>P: Staging + match pekerjaan
  U->>P: Apply / map / promote draft
  U->>K: Lengkapi kontrak
  U->>K: Push ke SPSE
  K->>API: POST /kontrak/push
  API->>SP: Isi form SPSE
```

| Arah | Isi |
|------|-----|
| SPSE → Arumanis | Paket, dokumen, match staging |
| Arumanis → SPSE | Push data kontrak (opsional) |

---

### 4.3 Lab GIS (`arumanis-gis`)

```mermaid
flowchart LR
  PORTAL[Portal Arumanis] -->|POST handoff code| GISBFF[BFF Lab GIS]
  GISBFF -->|exchange code → cookie| UI[React + MapLibre /gis]
  UI --> GISBFF
  GISBFF -->|Bearer| API[APIAMIS]
  API --> DATA[Pekerjaan · foto GPS · wilayah]
```

- Login **hanya SSO** dari portal (pola sama pengawasan).
- Fokus: peta, analisis spasial, batas admin, foto ber-GPS.

---

### 4.4 Instagram (Meta)

```mermaid
flowchart TB
  META[Meta Graph API / Webhooks] <-->|token + webhook| BFF[BFF Arumanis<br/>server/instagram]
  BFF --> CACHE[(data/instagram cache)]
  BFF --> ADMIN[Admin UI /instagram]
  BFF --> LAND[Landing #instagram gallery]
```

| Fitur | Jalur |
|-------|--------|
| Gallery publik | `GET /bff/instagram/gallery` (cache) |
| Inbox DM / balas | Admin + Human Agent tag |
| Komentar / events | Webhook → cache |

*Instagram di-handle di BFF portal, bukan di Laravel (kecuali ada proxy status terpisah).*

---

### 4.5 WhatsApp (Baileys)

```mermaid
flowchart LR
  UI[Portal /whatsapp admin] --> API[APIAMIS WhatsAppController]
  API --> BR[Bridge Baileys<br/>127.0.0.1:4000]
  BR <--> WA[WhatsApp multi-device]
  BR --> AUTH[(storage whatsapp-auth)]
```

- Production: bridge **bundled** di container APIAMIS.
- Dev: `bun run whatsapp:bridge` di repo portal.

---

### 4.6 Panel pengawasan web + mobile

```mermaid
flowchart TB
  subgraph Web["Panel web /pengawasan"]
    SSO[SSO handoff dari portal]
    WBFF[BFF pengawasan]
    WUI[Dashboard pengawas]
    SSO --> WBFF --> WUI
    WBFF --> API
  end

  subgraph Mobile["Apps mobile Expo"]
    LOGIN[Login / Google OAuth]
    SEC[SecureStore token]
    FEAT[Foto GPS · Progress · Tiket · Presence]
    LOGIN --> SEC --> FEAT
    FEAT --> API
  end

  API[APIAMIS]
  API --> SCOPE[byUserRole + user-pekerjaan]
  API --> REV[Reverb presence / notif]
  REV -.-> WUI
  REV -.-> FEAT
```

| Fitur lapangan | Web panel | Mobile | Tampil di portal |
|----------------|:---------:|:------:|------------------|
| Daftar paket assign | ✓ | ✓ | user-pekerjaan |
| Foto + GPS | ✓ | ✓ | peta, dashboard |
| Progress estimasi | ✓ | ✓ | deviasi / PUSPEN |
| Tiket | ✓ | ✓ | modul tiket |
| Presence / lokasi | — | ✓ heartbeat | Lokasi pengawas |
| Offline queue upload | — | ✓ | setelah online |

---

## 5. Alur data bisnis (inti)

```mermaid
flowchart TB
  SIPD2[SIPD Renja] -.->|link kegiatan| KEG[Kegiatan / RKA]
  SPSE2[SPSE paket] -.->|staging apply| PEK
  KEG --> PEK[Pekerjaan]
  PEK --> KON[Kontrak + Penyedia]
  PEK --> FOTO[Foto + GPS]
  PEK --> OUT[Output]
  PEK --> PEN[Penerima]
  PEK --> PROG[Progress / Estimasi]
  PEK --> BER[Berkas / OnlyOffice]
  PEK --> CHK[Checklist / PUSPEN]
  PEK --> UP[User–Pekerjaan assign]
  UP --> PWUI[Panel & Mobile pengawas]
  FOTO --> MAP[Peta portal + Lab GIS]
  PEK --> DASH[Dashboard / Executive / SPM]
  PEK --> PUB2[Publikasi / Blog]
```

---

## 6. Deploy & path produksi (ringkas)

```text
https://arumanis.cianjur.space/
├── /                    → Portal Arumanis (SPA + BFF)
├── /pengawasan/*        → Panel pengawas (SPA terpisah, exclude SW)
├── /gis/*               → Lab GIS (SPA terpisah)
├── /bff/*               → BFF portal (api, sipd, instagram, auth)
└── (static / PWA)

https://apiamis.cianjur.space/api
├── REST + Sanctum
├── Reverb (realtime)
└── WhatsApp bridge internal :4000

https://sipd-lite.cianjur.space     → SIPD Lite + cache
https://spse.inaproc.id/cianjurkab  → SPSE LPSE
```

| Repo lokal | Peran |
|------------|--------|
| `C:\laragon\www\bun` | Portal Arumanis + BFF |
| `C:\laragon\www\apiamis` | Backend APIAMIS |
| `C:\laragon\www\pengawas` | Panel web + `apps/mobile` |
| `C:\laragon\www\arumanis-gis` | Lab GIS |

---

## 7. Ringkasan arah integrasi

| Sistem | Baca ke Arumanis | Tulis dari Arumanis | Titik sentuh UI |
|--------|:----------------:|:-------------------:|-----------------|
| **SIPD** | ✓ Renja cache | ✗ | `/sipd-renja` |
| **SPSE** | ✓ paket, dokumen | ✓ push kontrak | `/procurement-sync`, detail kontrak |
| **Lab GIS** | ✓ pekerjaan/foto | (via APIAMIS sama) | `/gis` (SSO) |
| **Instagram** | ✓ media, DM, komentar | ✓ balas DM | `/instagram`, landing |
| **WhatsApp** | ✓ chat status | ✓ kirim pesan | `/whatsapp` |
| **Panel pengawasan** | ✓ assign paket | ✓ foto, progress, tiket | `/pengawasan` |
| **Mobile** | ✓ | ✓ + presence GPS | APK Expo |
| **OpenData** | ✓ KK desa | ✗ | sync desa (admin) |
| **OnlyOffice** | — | edit berkas | tab berkas pekerjaan |

---

## 8. Referensi

| Dokumen | Isi |
|---------|-----|
| [integrasi-platform.md](./integrasi-platform.md) | Detail alur SPSE, SIPD, SSO, mobile |
| [runbooks/spse.md](./runbooks/spse.md) | Session bookmarklet SPSE |
| [runbooks/whatsapp.md](./runbooks/whatsapp.md) | Bridge Baileys |
| [instagram-meta-setup.md](./instagram-meta-setup.md) | Meta app & token |
| [runbooks/onlyoffice.md](./runbooks/onlyoffice.md) | Editor dokumen |
| `.agent/SYSTEM_OVERVIEW.md` | FE ↔ BE |
| APIAMIS `README.md` | Domain API & posisi backend |

*Update diagram ini jika path deploy, pola auth, atau integrasi baru berubah di kode.*
