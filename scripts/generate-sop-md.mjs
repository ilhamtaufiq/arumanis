#!/usr/bin/env node
/**
 * Generate SOP Markdown — semua modul Arumanis, Puspen, Panel Pengawasan.
 * - Diagram alur: SVG + PNG (docs/sop-flow/, docs/sop-flow-png/)
 * - Snapshot operasional: database APIAMIS lokal (MySQL)
 * - Role lapangan setara: pengawas, konsultan_pengawas, tfl
 * - Label di dokumen: "Diagram Alur" (tanpa menyebut engine)
 */

import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { ALL_SOPS, SOP_KETERANGAN } from "./sop-modules-data.mjs";
import {
  buildFlowDefinition,
  buildFlowSvg,
  buildOverviewSvg,
  svgStringToPngBuffer,
} from "./lib/sop-diagram.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = resolve(ROOT, "docs/SOP-PENGGUNAAN-ARUMANIS.md");
const FLOW_DIR = resolve(ROOT, "docs/sop-flow");
const PNG_DIR = resolve(ROOT, "docs/sop-flow-png");
const LIVE_OUT = resolve(ROOT, "docs/sop-live-data.json");

const DOC_VERSION = "1.3";
const DOC_DATE = "19 Juli 2026";
const DOC_DATE_SHORT = "19 Juli 2026";

/** Role inti (urut tampilan). Lapangan = pengawas + konsultan_pengawas + tfl (setara). */
const CORE_ROLES = [
  {
    name: "admin",
    group: "Kantor",
    akses: "Semua data; bypass route/menu; settings, broadcast, IAM, impersonate",
    app: "Arumanis",
  },
  {
    name: "operator",
    group: "Kantor",
    akses: "Hampir semua data di portal; kontrak, register dokumen, import/export",
    app: "Arumanis",
  },
  {
    name: "pengawas",
    group: "Lapangan",
    akses: "Hanya pekerjaan ter-assign (user_pekerjaan); foto GPS, progress, tiket, laporan",
    app: "Panel Pengawasan",
  },
  {
    name: "konsultan_pengawas",
    group: "Lapangan",
    akses: "Setara pengawas — scope assign; Panel Pengawasan / lapangan",
    app: "Panel Pengawasan",
  },
  {
    name: "tfl",
    group: "Lapangan",
    akses: "Setara pengawas & konsultan_pengawas — scope assign; Panel Pengawasan",
    app: "Panel Pengawasan",
  },
  {
    name: "user",
    group: "Terbatas",
    akses: "Assign dan/atau kegiatan_role; view terbatas (bukan full master data)",
    app: "Arumanis (terbatas)",
  },
];

const B = "border:1px solid #000;";
const FONT = "font-family:Arial,Helvetica,sans-serif;font-size:11px;";
const TH = `style="${B}background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;${FONT}"`;
const TD = `style="${B}padding:6px;vertical-align:top;${FONT}"`;
const TDC = `style="${B}padding:6px;text-align:center;vertical-align:middle;${FONT}"`;
const TITLE = `style="${B}background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;${FONT}"`;

const COL_LABEL = {
  admin: "Admin",
  operator: "Operator",
  pengawas: "Pengawas",
  sistem: "Sistem",
};

const esc = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

function platformVersion() {
  try {
    const raw = readFileSync(resolve(ROOT, "platform.version.json"), "utf8");
    return JSON.parse(raw).version ?? "0.8.0";
  } catch {
    return "0.8.0";
  }
}

/* ─── Live data dari MySQL lokal ─── */

function mysqlQuery(sql) {
  try {
    const out = execFileSync(
      "mysql",
      ["-u", "root", "apiamis", "-N", "-B", "-e", sql],
      { encoding: "utf8", windowsHide: true, maxBuffer: 2 * 1024 * 1024 },
    );
    return out.trim();
  } catch (err) {
    console.warn("⚠ MySQL query gagal:", err.message?.slice(0, 200) ?? err);
    return "";
  }
}

function count(sql) {
  const v = mysqlQuery(sql);
  const n = Number(v.split("\n")[0]?.trim());
  return Number.isFinite(n) ? n : 0;
}

function fetchLiveData() {
  const snapshot_at = new Date().toISOString();
  const source = {
    host: "127.0.0.1",
    database: "apiamis",
    mode: "local-mysql",
  };

  const counts = {
    users: count("SELECT COUNT(*) FROM users"),
    roles: count("SELECT COUNT(*) FROM roles"),
    permissions: count("SELECT COUNT(*) FROM permissions"),
    route_permissions: count("SELECT COUNT(*) FROM route_permissions"),
    menu_permissions: count("SELECT COUNT(*) FROM menu_permissions"),
    kegiatan: count("SELECT COUNT(*) FROM tbl_kegiatan"),
    pekerjaan: count("SELECT COUNT(*) FROM tbl_pekerjaan"),
    draft_pekerjaan: count("SELECT COUNT(*) FROM tbl_draft_pekerjaan"),
    kontrak: count("SELECT COUNT(*) FROM tbl_kontrak"),
    kontrak_addendum: count("SELECT COUNT(*) FROM tbl_kontrak_addendums"),
    penyedia: count("SELECT COUNT(*) FROM tbl_penyedia"),
    output: count("SELECT COUNT(*) FROM tbl_output"),
    penerima: count("SELECT COUNT(*) FROM tbl_penerima"),
    tiket: count("SELECT COUNT(*) FROM tbl_tiket"),
    tiket_closed: count("SELECT COUNT(*) FROM tbl_tiket WHERE status = 'closed'"),
    foto: count("SELECT COUNT(*) FROM tbl_foto"),
    progress: count("SELECT COUNT(*) FROM tbl_progress"),
    pengawas: count("SELECT COUNT(*) FROM pengawas"),
    user_pekerjaan: count("SELECT COUNT(*) FROM user_pekerjaan"),
    kecamatan: count("SELECT COUNT(*) FROM tbl_kecamatan"),
    desa: count("SELECT COUNT(*) FROM tbl_desa"),
    unit_spam: count("SELECT COUNT(*) FROM tbl_unit_spam"),
    spm_sanitasi: count("SELECT COUNT(*) FROM tbl_spm_sanitasi"),
    berkas: count("SELECT COUNT(*) FROM tbl_berkas"),
    blog: count("SELECT COUNT(*) FROM tbl_blog"),
    audit_logs: count("SELECT COUNT(*) FROM tbl_audit_logs"),
    notifications: count("SELECT COUNT(*) FROM notifications"),
    puspen_progress_fisik: count("SELECT COUNT(*) FROM puspen_progress_fisik"),
    panduan_pages: count("SELECT COUNT(*) FROM panduan_pages"),
  };

  const rolesRaw = mysqlQuery(`
    SELECT r.name, COUNT(DISTINCT mhr.model_id)
    FROM roles r
    LEFT JOIN model_has_roles mhr
      ON mhr.role_id = r.id AND mhr.model_type LIKE '%User%'
    GROUP BY r.id, r.name
    ORDER BY COUNT(DISTINCT mhr.model_id) DESC
  `);
  const rolesByName = {};
  const roles = rolesRaw
    ? rolesRaw
        .split("\n")
        .filter(Boolean)
        .map((line) => {
          const parts = line.split("\t");
          const row = { name: parts[0], users: Number(parts[1]) || 0 };
          rolesByName[row.name] = row.users;
          return row;
        })
    : [];

  const dualRoleRaw = mysqlQuery(`
    SELECT u.name, u.email, GROUP_CONCAT(r.name ORDER BY r.name SEPARATOR ', ')
    FROM users u
    JOIN model_has_roles mhr ON mhr.model_id = u.id
    JOIN roles r ON r.id = mhr.role_id
    GROUP BY u.id, u.name, u.email
    HAVING COUNT(r.id) > 1
    ORDER BY COUNT(r.id) DESC, u.name
  `);
  const dual_roles = dualRoleRaw
    ? dualRoleRaw
        .split("\n")
        .filter(Boolean)
        .map((line) => {
          const parts = line.split("\t");
          return {
            name: (parts[0] || "").trim(),
            email: (parts[1] || "").trim(),
            roles: (parts[2] || "").replace(/\r/g, "").trim(),
          };
        })
    : [];

  const fieldUsers =
    (rolesByName.pengawas || 0) +
    (rolesByName.konsultan_pengawas || 0) +
    (rolesByName.tfl || 0);

  const data = {
    snapshot_at,
    source,
    platform: platformVersion(),
    sop_count: ALL_SOPS.length,
    counts,
    roles,
    roles_by_name: rolesByName,
    field_role_users: fieldUsers,
    dual_roles,
  };

  writeFileSync(LIVE_OUT, JSON.stringify(data, null, 2), "utf8");
  console.log(`✓ Snapshot DB: ${LIVE_OUT}`);
  return data;
}

/* ─── Diagram alur (SVG + PNG, style flowchart TD) ─── */

function writeDiagram(sop) {
  mkdirSync(FLOW_DIR, { recursive: true });
  mkdirSync(PNG_DIR, { recursive: true });

  const svg = buildFlowSvg(sop.steps);
  const definition = buildFlowDefinition(sop.steps, sop.id);
  const svgRel = `sop-flow/${sop.slug}.svg`;
  const pngRel = `sop-flow-png/${sop.slug}.png`;

  writeFileSync(resolve(ROOT, "docs", svgRel), svg, "utf8");
  writeFileSync(resolve(FLOW_DIR, `${sop.slug}.flow.txt`), definition, "utf8");

  try {
    const png = svgStringToPngBuffer(svg, 2);
    writeFileSync(resolve(ROOT, "docs", pngRel), png);
  } catch (err) {
    console.warn(`  ⚠ PNG ${sop.slug}:`, err.message?.slice(0, 80));
  }

  return { svgRel, pngRel };
}

/* ─── Tabel kegiatan (format pemerintah, pelaksana teks) ─── */

function pelaksanaLabel(step) {
  const col = step.flow?.col ?? "operator";
  return COL_LABEL[col] ?? col;
}

function sopTable(sop) {
  const { lampiran, title, steps, route } = sop;
  const { pngRel, svgRel } = writeDiagram(sop);

  const rows = steps
    .map((step) => {
      return `<tr>
  <td ${TDC}>${esc(step.no)}</td>
  <td ${TD}>${esc(step.kegiatan)}</td>
  <td ${TDC}>${esc(pelaksanaLabel(step))}</td>
  <td ${TD}>${esc(step.persyaratan ?? step.kategori ?? "")}</td>
  <td ${TDC}>${esc(step.waktu ?? "")}</td>
  <td ${TD}>${esc(step.output ?? "")}</td>
  <td ${TD}>${esc(step.ket ?? "")}</td>
</tr>`;
    })
    .join("\n");

  const routeLine =
    route && route !== "—"
      ? `<p style="${FONT}margin:4px 0;"><strong>Route:</strong> <code>${esc(route)}</code></p>`
      : "";

  return `${routeLine}<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;${FONT}">
<tr><td colspan="7" ${TITLE}>${esc(lampiran)}</td></tr>
<tr><td colspan="7" style="${B}text-align:center;padding:8px;${FONT}">
Standar Operasional Prosedur (SOP) Penggunaan Aplikasi ARUMANIS dan Panel Pengawasan — Satu Data Air Minum dan Sanitasi Kabupaten Cianjur
</td></tr>
<tr><td colspan="7" style="${B}text-align:center;padding:6px;${FONT}">Nomor : ....................................&emsp;&emsp;Tanggal : ${DOC_DATE_SHORT}</td></tr>
<tr><td colspan="7" ${TITLE}>${esc(title)}</td></tr>
<tr>
  <td ${TH}>No.</td>
  <td ${TH}>Kegiatan</td>
  <td ${TH}>Pelaksana</td>
  <td ${TH}>Persyaratan / Kelengkapan</td>
  <td ${TH}>Waktu</td>
  <td ${TH}>Output</td>
  <td ${TH}>Ket</td>
</tr>
${rows}
</table>

#### Diagram Alur

![Diagram alur ${esc(sop.id)}](${pngRel})

<p style="${FONT}color:#666;font-size:10px;"><em>Sumber: <a href="${svgRel}">${svgRel}</a> · <a href="${pngRel}">${pngRel}</a></em></p>`;
}

function pengesahan() {
  const cell = (content, extra = "", attrs = "") =>
    `<td ${attrs} style="${B}padding:8px;vertical-align:top;${FONT}${extra}">${content}</td>`;
  const metaRow = (label, value) =>
    `<tr><td align="right" width="42%" style="padding:3px;${FONT}"><b>${label}</b></td><td style="padding:3px;${FONT}">: ${value}</td></tr>`;
  const leftBlock = (title, items) =>
    `<b>${title}</b><br>${items.map((t, i) => `${i + 1}. ${esc(t)}`).join("<br>")}`;

  return `<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;${FONT}">
<tr>
  ${cell("DINAS PEKERJAAN UMUM DAN TATA RUANG<br>KABUPATEN CIANJUR", "width:50%")}
  ${cell(`<table width="100%" border="0" cellpadding="2">${metaRow("Nama SOP", "SOP Penggunaan Arumanis &amp; Panel Pengawasan")}</table>`, "width:50%")}
</tr>
<tr>${cell("BIDANG AIR MINUM DAN SANITASI")}${cell(`<table width="100%" border="0" cellpadding="2">${metaRow("Tgl Pembuatan", "1 Juli 2026")}</table>`)}</tr>
<tr>
  ${cell("SEKSI PERENCANAAN DAN PENGEMBANGAN SISTEM INFORMASI", "", 'rowspan="4"')}
  ${cell(`<table width="100%" border="0" cellpadding="2">${metaRow("Tanggal Revisi", DOC_DATE_SHORT)}</table>`)}
</tr>
<tr>${cell(`<table width="100%" border="0" cellpadding="2">${metaRow("Tanggal Aktif", DOC_DATE_SHORT)}</table>`)}</tr>
<tr>${cell(`<table width="100%" border="0" cellpadding="2">${metaRow("Disahkan oleh", "Kepala Bidang Air Minum dan Sanitasi")}</table>`)}</tr>
<tr>${cell(`<b>Tanda Tangan dan Stempel</b><br><br><br><br><br>`, "text-align:center;height:90px")}</tr>
<tr>
  ${cell("Nama SOP")}
  ${cell("<b>SOP PENGGUNAAN APLIKASI ARUMANIS<br>DAN PANEL PENGAWASAN</b>", "text-align:center;font-size:12px;font-weight:bold")}
</tr>
<tr>
  <td colspan="2" style="${B}padding:0;">
    <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse:collapse;${FONT}">
      <tr>
        <td style="${B}width:50%;vertical-align:top;${FONT}">${leftBlock("Dasar Hukum", [
          "Undang-Undang Nomor 25 Tahun 2009 tentang Pelayanan Publik.",
          "Peraturan Menteri Dalam Negeri Nomor 57 Tahun 2007 tentang Petunjuk Teknis Penataan Organisasi Perangkat Daerah.",
          "Peraturan Bupati Cianjur tentang Standar Pelayanan Minimum Air Minum dan Sanitasi.",
          "Keputusan Kepala Dinas terkait pembentukan SOP operasional sistem informasi ARUMANIS.",
        ])}</td>
        <td style="${B}width:50%;vertical-align:top;${FONT}">${leftBlock("Kualifikasi Pelaksana", [
          "Memahami tugas dan fungsi Bidang Air Minum dan Sanitasi.",
          "Memahami alur kerja aplikasi ARUMANIS (www/bun) dan Panel Pengawasan (www/pengawas).",
          "Admin/Operator: mampu mengelola master data, kontrak, dokumentasi, dan akses.",
          "Pengawas lapangan (role pengawas / konsultan_pengawas / tfl — setara): mampu mengisi foto ber-GPS, progress, laporan mingguan, dan tiket.",
        ])}</td>
      </tr>
      <tr>
        <td style="${B}vertical-align:top;${FONT}">${leftBlock("Keterangan", SOP_KETERANGAN)}</td>
        <td style="${B}vertical-align:top;${FONT}">${leftBlock("Peralatan / Perlengkapan", [
          "Perangkat komputer / laptop / tablet.",
          "Browser Chrome, Firefox, atau Edge versi terbaru.",
          "Koneksi internet stabil.",
          "Akun APIAMIS aktif (email & password).",
          "GPS perangkat (untuk upload foto lapangan).",
          "ATK (bila mencetak dokumentasi foto PDF).",
        ])}</td>
      </tr>
      <tr>
        <td style="${B}vertical-align:top;${FONT}">${leftBlock("Peringatan", [
          "Setiap pengguna wajib menjaga kerahasiaan akun dan password.",
          "Data yang diinput harus sesuai kondisi di lapangan; kesalahan menjadi tanggung jawab penginput.",
          "Foto dokumentasi wajib memuat koordinat GPS dalam batas desa pekerjaan.",
          "Progress mingguan wajib diisi sebelum batas waktu yang ditetapkan unit.",
          "Dilarang menambahkan trailer Co-authored-by bot/AI pada commit sistem.",
        ])}</td>
        <td style="${B}vertical-align:top;${FONT}">${leftBlock("Pencatatan dan Pendataan", [
          "Database APIAMIS lokal (MySQL) — sumber snapshot operasional SOP.",
          "Audit Trail di modul /audit-logs (Arumanis).",
          "Berkas digital di modul Berkas & Drive 3-zona.",
          "Dokumentasi foto slot 0%–100% di Panel Pengawasan.",
          "Tiket dan notifikasi sebagai jejak tindak lanjut.",
        ])}</td>
      </tr>
    </table>
  </td>
</tr>
</table>`;
}

function fmt(n) {
  return Number(n ?? 0).toLocaleString("id-ID");
}

function writeOverviewSvg() {
  mkdirSync(FLOW_DIR, { recursive: true });
  mkdirSync(PNG_DIR, { recursive: true });
  const svg = buildOverviewSvg();
  const relSvg = "sop-flow/sop-00-overview-integrasi.svg";
  const relPng = "sop-flow-png/sop-00-overview-integrasi.png";
  writeFileSync(resolve(ROOT, "docs", relSvg), svg, "utf8");
  try {
    writeFileSync(resolve(ROOT, "docs", relPng), svgStringToPngBuffer(svg, 2));
  } catch {
    /* ignore */
  }
  return relPng;
}

function snapshotSection(live) {
  const c = live.counts ?? {};
  const byName = live.roles_by_name ?? {};
  const overviewSvg = writeOverviewSvg();

  const coreRows = CORE_ROLES.map((r) => {
    const n = byName[r.name] ?? 0;
    return `| \`${esc(r.name)}\` | ${esc(r.group)} | ${fmt(n)} | ${esc(r.akses)} | ${esc(r.app)} |`;
  }).join("\n");

  const otherRoles = (live.roles ?? []).filter(
    (r) => !CORE_ROLES.some((c) => c.name === r.name),
  );
  const otherRows = otherRoles.length
    ? otherRoles.map((r) => `| \`${esc(r.name)}\` | ${fmt(r.users)} | Legacy / tidak dipakai operasional |`).join("\n")
    : "| — | 0 | — |";

  const dualRows = (live.dual_roles ?? []).length
    ? live.dual_roles
        .map((d) => `| ${esc(d.name)} | ${esc(d.email)} | ${esc(d.roles)} |`)
        .join("\n")
    : "| — | — | — |";

  const fieldN = live.field_role_users ?? 0;

  return `## Snapshot Operasional (Database Lokal)

> Sumber: MySQL \`apiamis@127.0.0.1\` (restore lokal) · Snapshot: \`${live.snapshot_at}\` · Platform **v${live.platform}**

### Alur Integrasi Sistem

![Alur integrasi Arumanis](${overviewSvg})


### Matriks Role

Kolom **Pelaksana** di lembar SOP memakai label ringkas: **Admin**, **Operator**, **Pengawas**, **Sistem**.  
**Pengawas** pada SOP mencakup tiga role lapangan yang **setara**: \`pengawas\`, \`konsultan_pengawas\`, dan \`tfl\`.

| Role (DB) | Kelompok | User | Akses data / fungsi | Aplikasi utama |
|:----------|:---------|-----:|:--------------------|:---------------|
${coreRows}

**Jumlah akun role lapangan (pengawas + konsultan_pengawas + tfl):** ${fmt(fieldN)}  
*(satu user bisa multi-role; angka per baris di atas adalah hitungan unik per role, bukan eksklusif)*

#### Role legacy / non-inti

| Role | User | Catatan |
|:-----|-----:|:--------|
${otherRows}

#### User multi-role (dual/triple)

| Nama | Email | Roles |
|:-----|:------|:------|
${dualRows}

> Dual \`operator\` + role lapangan: di **portal Arumanis** data pekerjaan full (operator); di **Panel Pengawasan** tetap dibatasi assign.

### Volume Data Induk

| Entitas | Jumlah |
|:--------|------:|
| Users | ${fmt(c.users)} |
| Roles | ${fmt(c.roles)} |
| Permissions | ${fmt(c.permissions)} |
| Route permissions | ${fmt(c.route_permissions)} |
| Kegiatan | ${fmt(c.kegiatan)} |
| Pekerjaan | ${fmt(c.pekerjaan)} |
| Draft pekerjaan | ${fmt(c.draft_pekerjaan)} |
| Kontrak | ${fmt(c.kontrak)} |
| Addendum kontrak | ${fmt(c.kontrak_addendum)} |
| Penyedia | ${fmt(c.penyedia)} |
| Output | ${fmt(c.output)} |
| Penerima manfaat | ${fmt(c.penerima)} |
| Pengawas (master NIP) | ${fmt(c.pengawas)} |
| Assign user↔pekerjaan | ${fmt(c.user_pekerjaan)} |
| Kecamatan | ${fmt(c.kecamatan)} |
| Desa | ${fmt(c.desa)} |
| Unit SPAM | ${fmt(c.unit_spam)} |
| SPM Sanitasi | ${fmt(c.spm_sanitasi)} |

### Operasional Lapangan & Pelaporan

| Entitas | Jumlah |
|:--------|------:|
| Foto dokumentasi | ${fmt(c.foto)} |
| Progress (laporan) | ${fmt(c.progress)} |
| Tiket | ${fmt(c.tiket)} |
| Tiket closed | ${fmt(c.tiket_closed)} |
| Berkas digital | ${fmt(c.berkas)} |
| Progress fisik Puspen | ${fmt(c.puspen_progress_fisik)} |
| Notifikasi | ${fmt(c.notifications)} |
| Audit logs | ${fmt(c.audit_logs)} |
| Publikasi (blog) | ${fmt(c.blog)} |
| Halaman panduan | ${fmt(c.panduan_pages)} |

---
`;
}

function daftarIsi() {
  const header = `| No | Lembar | Judul | Route | Aplikasi |
|:---|:-------|:------|:------|:---------|
| — | Halaman Pengesahan | Metadata & pengesahan SOP | — | — |`;
  const rows = ALL_SOPS.map((s) => {
    const no = String(s.num).padStart(2, "0");
    return `| ${no} | ${esc(s.id)} | ${esc(s.title.replace("PROSEDUR PELAKSANAAN ", ""))} | ${esc(s.route ?? "—")} | ${esc(s.app)} |`;
  }).join("\n");
  return `${header}\n${rows}`;
}

function sopSections() {
  let currentCategory = "";
  const parts = [];
  for (const sop of ALL_SOPS) {
    if (sop.category && sop.category !== currentCategory) {
      currentCategory = sop.category;
      if (currentCategory !== "Integrasi") {
        parts.push(`\n## Bagian: ${currentCategory}\n`);
      }
    }
    parts.push(`## ${sop.id}\n\n${sopTable(sop)}\n\n---\n`);
  }
  return parts.join("\n");
}

/* ─── Main ─── */

const live = fetchLiveData();
const platform = live.platform ?? platformVersion();

const body = `# SOP Penggunaan Arumanis & Panel Pengawasan

| Item | Nilai |
|:-----|:------|
| **Versi dokumen** | ${DOC_VERSION} |
| **Tanggal** | ${DOC_DATE} |
| **Platform** | Arumanis v${platform} |
| **Total SOP** | ${ALL_SOPS.length} lembar |
| **Sumber data** | MySQL lokal \`apiamis\` (restore) |
| **Snapshot** | \`${live.snapshot_at}\` |
| **Word** | \`docs/SOP_PENGGUNAAN_ARUMANIS.docx\` |
| **Excel** | \`docs/SOP_PENGGUNAAN_ARUMANIS.xlsx\` |
| **Live JSON** | \`docs/sop-live-data.json\` |
| **Regenerasi** | \`bun run docs:sop:md\` |

> Format: halaman pengesahan + tabel kegiatan + **diagram alur**. Snapshot volume data dari database APIAMIS lokal. Role lapangan **setara**: \`pengawas\`, \`konsultan_pengawas\`, \`tfl\`.

---

## Halaman Pengesahan

${pengesahan()}

---

${snapshotSection(live)}

## Daftar Isi

${daftarIsi()}

**Legenda diagram:** Kotak biru = proses · Kotak merah = aksi utama · Belah ketupat hijau = keputusan · Panah solid = Ya/lanjut · Panah putus-putus = Tidak/loop  
**Legenda pelaksana:** Admin = role \`admin\` · Operator = role \`operator\` · Pengawas = role \`pengawas\` / \`konsultan_pengawas\` / \`tfl\` (setara) · Sistem = backend APIAMIS

---

${sopSections()}

## Lampiran Referensi

| Dokumen | Lokasi |
|:--------|:-------|
| Panduan modul | [docs/user-guide/](user-guide/index.md) |
| Panel pengawasan | [docs/user-guide/pengawas-panel.md](user-guide/pengawas-panel.md) |
| Diagram alur (SVG/PNG) | [docs/sop-flow/](sop-flow/) · [docs/sop-flow-png/](sop-flow-png/) |
| Snapshot DB | [docs/sop-live-data.json](sop-live-data.json) |
| Sidebar modul | \`src/components/layout/data/sidebar-data.ts\` |

| Regenerasi | Perintah |
|:-----------|:---------|
| Markdown + DB | \`bun run docs:sop:md\` |
| Word | \`bun run docs:sop\` |
| Excel | \`bun run docs:sop:xlsx\` |

---

*${ALL_SOPS.length} SOP — satu lembar per modul/alur. Diagram alur (PNG/SVG); data operasional dari MySQL \`apiamis\` lokal. Role lapangan setara: pengawas, konsultan_pengawas, tfl.*
`;

writeFileSync(OUT, body, "utf8");
console.log(`✓ SOP Markdown tersimpan: ${OUT} (${ALL_SOPS.length} lembar)`);
console.log(`✓ Diagram SVG: ${FLOW_DIR}`);
console.log(`✓ Diagram PNG: ${PNG_DIR}`);
console.log(`✓ Live DB snapshot v${platform} (field roles: pengawas=konsultan_pengawas=tfl)`);
