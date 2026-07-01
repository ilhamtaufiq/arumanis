#!/usr/bin/env node
/**
 * Generate SOP Markdown — format pemerintah (contoh sop.png + halaman pengesahan.png)
 * Flowchart shape di kolom Pelaksana, satu tabel terintegrasi.
 */

import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = resolve(ROOT, "docs/SOP-PENGGUNAAN-ARUMANIS.md");

const B = "border:1px solid #000;";
const FONT = "font-family:Arial,Helvetica,sans-serif;font-size:11px;";
const TH = `style="${B}background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;${FONT}"`;
const TD = `style="${B}padding:6px;vertical-align:top;${FONT}"`;
const TDC = `style="${B}padding:6px;text-align:center;vertical-align:middle;${FONT}"`;
const TDM = `style="${B}padding:6px;text-align:center;vertical-align:middle;background:#F4B183;font-weight:bold;${FONT}"`;
const FLOW = `style="${B}padding:4px;text-align:center;vertical-align:middle;background:#fff;min-width:68px;${FONT}"`;
const TITLE = `style="${B}background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;${FONT}"`;

const esc = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

function connector(show) {
  if (!show) return "";
  return `<div style="color:#000;font-size:13px;line-height:1;margin:1px 0;">&#9474;<br>&#9660;</div>`;
}

function shapeProcess(label, color = "#5B9BD5", conn = true) {
  return `${connector(conn)}<div style="border:1.5px solid #000;background:${color};color:#fff;padding:5px 8px;font-weight:bold;font-size:10px;display:inline-block;min-width:52px;">${esc(label)}</div>`;
}

function shapeRed(label, conn = true) {
  return shapeProcess(label, "#E74C3C", conn);
}

function shapeDecision(label, conn = true, showYa = true) {
  return `${connector(conn)}
<div style="position:relative;width:62px;height:58px;margin:2px auto;">
  <div style="width:40px;height:40px;background:#C6E0B4;border:1.5px solid #000;transform:rotate(45deg);position:absolute;top:9px;left:11px;"></div>
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-weight:bold;font-size:8px;z-index:1;width:50px;text-align:center;">${esc(label)}</div>
</div>${showYa ? '<div style="font-size:9px;font-weight:bold;margin-top:2px;">Ya</div>' : ""}`;
}

const ROLE_COLS = ["admin", "operator", "pengawas", "sistem"];
const ROLE_LABELS = ["Admin", "Operator", "Pengawas", "Sistem"];

function pelaksanaCells(step, stepIndex, steps) {
  const roles = step.roles ?? {};
  const flow = step.flow;
  const prevFlow = stepIndex > 0 ? steps[stepIndex - 1].flow : null;
  const sameCol = prevFlow && flow && prevFlow.col === flow.col;

  return ROLE_COLS.map((role) => {
    if (flow && flow.col === role) {
      let html = "";
      const conn = stepIndex > 0 && !sameCol;
      if (flow.type === "process") html = shapeProcess(flow.label, flow.color ?? "#5B9BD5", conn);
      else if (flow.type === "red") html = shapeRed(flow.label, conn);
      else if (flow.type === "decision") html = shapeDecision(flow.label, conn, flow.showYa !== false);
      return `<td ${FLOW}>${html}</td>`;
    }
    // SOP pemerintah: shape satu kolom; ● hanya bila tidak ada flow atau kolom Sistem pendukung
    if (roles[role] && (!flow || role === "sistem")) return `<td ${TDM}>&#9679;</td>`;
    if (step.tidakIn === role)
      return `<td ${TDC} style="${B}padding:6px;text-align:center;vertical-align:middle;font-size:9px;font-weight:bold;${FONT}">Tidak</td>`;
    return `<td ${TDC}>&nbsp;</td>`;
  }).join("\n");
}

function sopTable(lampiran, title, steps) {
  const rows = steps
    .map(
      (step, i) => `<tr>
  <td ${TDC}>${esc(step.no)}</td>
  <td ${TD}>${esc(step.kegiatan)}</td>
  ${pelaksanaCells(step, i, steps)}
  <td ${TD}>${esc(step.persyaratan ?? step.kategori ?? "")}</td>
  <td ${TDC}>${esc(step.waktu ?? "")}</td>
  <td ${TD}>${esc(step.output ?? "")}</td>
  <td ${TD}>${esc(step.ket ?? "")}</td>
</tr>`,
    )
    .join("\n");

  return `<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;${FONT}">
<tr><td colspan="10" ${TITLE}>${esc(lampiran)}</td></tr>
<tr><td colspan="10" style="${B}text-align:center;padding:8px;${FONT}">
Standar Operasional Prosedur (SOP) Penggunaan Aplikasi ARUMANIS dan Panel Pengawasan — Satu Data Air Minum dan Sanitasi Kabupaten Cianjur
</td></tr>
<tr><td colspan="10" style="${B}text-align:center;padding:6px;${FONT}">Nomor : ....................................&emsp;&emsp;Tanggal : 1 Juli 2026</td></tr>
<tr><td colspan="10" ${TITLE}>${esc(title)}</td></tr>
<tr>
  <td rowspan="2" ${TH}>No.</td>
  <td rowspan="2" ${TH}>Kegiatan</td>
  <td colspan="4" ${TH}>Pelaksana</td>
  <td colspan="3" ${TH}>Mutu Baku</td>
  <td rowspan="2" ${TH}>Ket</td>
</tr>
<tr>
  ${ROLE_LABELS.map((l) => `<td ${TH}>${l}</td>`).join("\n  ")}
  <td ${TH}>Persyaratan / Kelengkapan</td>
  <td ${TH}>Waktu</td>
  <td ${TH}>Output</td>
</tr>
${rows}
</table>`;
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
<tr>
  ${cell("BIDANG AIR MINUM DAN SANITASI")}
  ${cell(`<table width="100%" border="0" cellpadding="2">${metaRow("Tgl Pembuatan", "1 Juli 2026")}</table>`)}
</tr>
<tr>
  ${cell("SEKSI PERENCANAAN DAN PENGEMBANGAN SISTEM INFORMASI", "", 'rowspan="4"')}
  ${cell(`<table width="100%" border="0" cellpadding="2">${metaRow("Tanggal Revisi", "—")}</table>`)}
</tr>
<tr>
  ${cell(`<table width="100%" border="0" cellpadding="2">${metaRow("Tanggal Aktif", "1 Juli 2026")}</table>`)}
</tr>
<tr>
  ${cell(`<table width="100%" border="0" cellpadding="2">${metaRow("Disahkan oleh", "Kepala Bidang Air Minum dan Sanitasi")}</table>`)}
</tr>
<tr>
  ${cell(`<b>Tanda Tangan dan Stempel</b><br><br><br><br><br>`, "text-align:center;height:90px")}
</tr>
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
          "Admin/Operator: mampu mengelola master data, kontrak, dan akses.",
          "Pengawas: mampu mengisi foto ber-GPS, progress, dan tiket lapangan.",
        ])}</td>
      </tr>
      <tr>
        <td style="${B}vertical-align:top;${FONT}">${leftBlock("Keterangan", [
          "SOP-01 Login & SSO",
          "SOP-02 Input Program (Arumanis Utama)",
          "SOP-03 Kontrak & Penyedia",
          "SOP-04 Pengawasan Lapangan",
          "SOP-05 Penugasan Pengawas",
          "SOP-06 Manajemen Akses",
          "Petunjuk Teknis Aplikasi Arumanis (docx)",
          "Panduan pengguna /docs dan /pengawasan/panduan",
        ])}</td>
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
          "Database APIAMIS (backend Laravel).",
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

const SOPS = [
  {
    id: "SOP-01 Login & SSO",
    lampiran: "LAMPIRAN I",
    title: "PROSEDUR PELAKSANAAN AKSES & AUTENTIKASI ARUMANIS / PANEL PENGAWASAN",
    steps: [
      {
        no: "1.",
        kegiatan: "Pengguna membuka URL Arumanis di browser terbaru.",
        roles: { admin: true, operator: true, pengawas: true },
        flow: { col: "operator", type: "process", label: "User" },
        persyaratan: "Browser terbaru, koneksi internet",
        waktu: "± 2 menit",
        output: "Halaman /sign-in",
      },
      {
        no: "2.",
        kegiatan: "Masukkan email & password APIAMIS lalu Sign In.",
        roles: { admin: true, operator: true, pengawas: true },
        flow: { col: "operator", type: "process", label: "Login" },
        persyaratan: "Akun APIAMIS aktif",
        waktu: "± 1 menit",
        output: "Sesi cookie terbentuk",
      },
      {
        no: "3.",
        kegiatan: "Sistem validasi kredensial via BFF → APIAMIS. Gagal: ulangi login.",
        roles: { sistem: true },
        flow: { col: "sistem", type: "decision", label: "Berhasil?" },
        tidakIn: "pengawas",
        persyaratan: "Kredensial benar",
        waktu: "Real-time",
        output: "Token valid / error",
        ket: "Ulangi langkah 2 bila Tidak",
      },
      {
        no: "4.",
        kegiatan: "Cek role: Admin/Operator/Viewer → Dashboard; Pengawas → SSO panel.",
        roles: { sistem: true },
        flow: { col: "sistem", type: "red", label: "Cek Role" },
        persyaratan: "Role terdaftar di APIAMIS",
        waktu: "Real-time",
        output: "Halaman tujuan",
      },
      {
        no: "5.",
        kegiatan: "SSO pengawas: /pengawasan/login?token → cookie pengawas_session.",
        roles: { pengawas: true, sistem: true },
        flow: { col: "pengawas", type: "process", label: "SSO", color: "#5B9BD5" },
        persyaratan: "Token SSO valid",
        waktu: "± 30 dtk",
        output: "Dashboard /pengawasan/",
        ket: "Tanpa login terpisah",
      },
      {
        no: "6.",
        kegiatan: "Operasional sesuai SOP modul. Logout via avatar → Logout.",
        roles: { admin: true, operator: true, pengawas: true },
        flow: { col: "operator", type: "process", label: "Selesai", color: "#5B9BD5" },
        persyaratan: "—",
        waktu: "Sesuai tugas",
        output: "Sesi berakhir",
      },
    ],
  },
  {
    id: "SOP-02 Input Program",
    lampiran: "LAMPIRAN II",
    title: "PROSEDUR PELAKSANAAN INPUT PROGRAM BARU (ARUMANIS UTAMA)",
    steps: [
      {
        no: "1.",
        kegiatan: "Login → buka /kegiatan.",
        roles: { admin: true, operator: true },
        flow: { col: "operator", type: "process", label: "Kegiatan" },
        persyaratan: "Hak akses modul kegiatan",
        waktu: "± 15 mnt",
        output: "Master kegiatan",
      },
      {
        no: "2.",
        kegiatan: "Tambah kegiatan: nama, kode, dana, pagu, TA.",
        roles: { operator: true },
        flow: { col: "operator", type: "process", label: "Tambah" },
        persyaratan: "Data pagu & TA",
        waktu: "± 10 mnt",
        output: "Kegiatan tersimpan",
      },
      {
        no: "3.",
        kegiatan: "Tambah pekerjaan: kegiatan, kecamatan, desa, pagu.",
        roles: { operator: true },
        flow: { col: "operator", type: "red", label: "Pekerjaan" },
        persyaratan: "Master wilayah desa",
        waktu: "± 15 mnt",
        output: "Pekerjaan aktif",
      },
      {
        no: "4.",
        kegiatan: "Tambah output & penerima per pekerjaan.",
        roles: { operator: true },
        flow: { col: "operator", type: "process", label: "Output" },
        persyaratan: "RAB / komponen",
        waktu: "± 20 mnt",
        output: "Komponen tercatat",
      },
      {
        no: "5.",
        kegiatan: "Upload berkas & foto awal (opsional).",
        roles: { operator: true },
        flow: { col: "operator", type: "process", label: "Berkas" },
        persyaratan: "File digital",
        waktu: "± 15 mnt",
        output: "File terunggah",
      },
      {
        no: "6.",
        kegiatan: "Verifikasi dashboard & data quality. Tidak lengkap → perbaiki.",
        roles: { admin: true, operator: true },
        flow: { col: "admin", type: "decision", label: "Lengkap?" },
        tidakIn: "operator",
        persyaratan: "Dashboard data quality",
        waktu: "± 5 mnt",
        output: "Data siap",
        ket: "Perbaiki data bila Tidak",
      },
    ],
  },
  {
    id: "SOP-03 Kontrak",
    lampiran: "LAMPIRAN III",
    title: "PROSEDUR PELAKSANAAN KONTRAK & PENYEDIA",
    steps: [
      {
        no: "1.",
        kegiatan: "Pastikan pekerjaan & penyedia terdaftar.",
        roles: { operator: true },
        flow: { col: "operator", type: "process", label: "Prasyarat" },
        persyaratan: "Master pekerjaan & penyedia",
        waktu: "± 10 mnt",
        output: "Data induk siap",
      },
      {
        no: "2.",
        kegiatan: "Buat kontrak: pekerjaan, penyedia, nilai, tanggal.",
        roles: { operator: true },
        flow: { col: "operator", type: "red", label: "Kontrak" },
        persyaratan: "Dokumen kontrak",
        waktu: "± 20 mnt",
        output: "Kontrak aktif",
      },
      {
        no: "3.",
        kegiatan: "Addendum & register dokumen bila diperlukan.",
        roles: { operator: true },
        flow: { col: "operator", type: "decision", label: "Addendum?" },
        tidakIn: "admin",
        persyaratan: "Register dokumen",
        waktu: "Sesuai kebutuhan",
        output: "Dokumen sinkron",
      },
      {
        no: "4.",
        kegiatan: "Verifikasi status kontrak di dashboard.",
        roles: { admin: true, operator: true },
        flow: { col: "admin", type: "process", label: "Selesai" },
        persyaratan: "Dashboard kontrak",
        waktu: "± 5 mnt",
        output: "Siap ditugaskan",
      },
    ],
  },
  {
    id: "SOP-04 Pengawasan",
    lampiran: "LAMPIRAN IV",
    title: "PROSEDUR PELAKSANAAN PEMANTAUAN LAPANGAN (PANEL PENGAWASAN)",
    steps: [
      {
        no: "1.",
        kegiatan: "Login SSO → Dashboard /pengawasan/.",
        roles: { pengawas: true, sistem: true },
        flow: { col: "pengawas", type: "process", label: "SSO Login" },
        persyaratan: "Akun & penugasan aktif",
        waktu: "± 2 mnt",
        output: "KPI tampil",
      },
      {
        no: "2.",
        kegiatan: "Baca KPI & buka paket perlu perhatian.",
        roles: { pengawas: true },
        flow: { col: "pengawas", type: "process", label: "Dashboard" },
        persyaratan: "Dashboard pengawasan",
        waktu: "Harian",
        output: "Prioritas paket",
      },
      {
        no: "3.",
        kegiatan: "Tab Penerima: kelola penerima individu/komunal.",
        roles: { pengawas: true },
        flow: { col: "pengawas", type: "red", label: "Penerima" },
        persyaratan: "Data penerima",
        waktu: "Per paket",
        output: "Penerima lengkap",
      },
      {
        no: "4.",
        kegiatan: "Tab Foto: upload slot 0–100% + GPS per output.",
        roles: { pengawas: true },
        flow: { col: "pengawas", type: "process", label: "Foto GPS" },
        persyaratan: "GPS aktif, foto lapangan",
        waktu: "Per kunjungan",
        output: "Matriks foto terisi",
      },
      {
        no: "5.",
        kegiatan: "Tab Progress / Buat Laporan: rencana & realisasi mingguan.",
        roles: { pengawas: true },
        flow: { col: "pengawas", type: "process", label: "Progress" },
        persyaratan: "Form progress mingguan",
        waktu: "Mingguan",
        output: "Deviasi terupdate",
      },
      {
        no: "6.",
        kegiatan: "Ada kendala? Buat tiket. Tidak → selesai.",
        roles: { pengawas: true },
        flow: { col: "pengawas", type: "decision", label: "Kendala?" },
        tidakIn: "sistem",
        persyaratan: "Modul tiket",
        waktu: "Sesuai kejadian",
        output: "Tiket / selesai",
      },
      {
        no: "7.",
        kegiatan: "Data tersinkron ke Arumanis via APIAMIS.",
        roles: { admin: true, sistem: true },
        flow: { col: "sistem", type: "process", label: "Sinkron" },
        persyaratan: "APIAMIS aktif",
        waktu: "Real-time",
        output: "Data kantor = lapangan",
      },
    ],
  },
  {
    id: "SOP-05 Penugasan",
    lampiran: "LAMPIRAN V",
    title: "PROSEDUR PELAKSANAAN PENUGASAN PENGAWAS",
    steps: [
      {
        no: "1.",
        kegiatan: "Admin: master /pengawas (NIP benar).",
        roles: { admin: true },
        flow: { col: "admin", type: "process", label: "Pengawas" },
        persyaratan: "Data NIP valid",
        waktu: "± 10 mnt",
        output: "Data valid",
      },
      {
        no: "2.",
        kegiatan: "User punya role pengawas di /users.",
        roles: { admin: true },
        flow: { col: "admin", type: "red", label: "User" },
        persyaratan: "Role pengawas",
        waktu: "± 5 mnt",
        output: "Role aktif",
      },
      {
        no: "3.",
        kegiatan: "Assign pekerjaan di /user-pekerjaan.",
        roles: { admin: true },
        flow: { col: "admin", type: "process", label: "Assign" },
        persyaratan: "Daftar pekerjaan",
        waktu: "± 15 mnt",
        output: "Paket di dashboard",
        ket: "Wajib",
      },
      {
        no: "4.",
        kegiatan: "Pengawas login: paket tampil? Tidak → ulangi assign.",
        roles: { pengawas: true, admin: true },
        flow: { col: "pengawas", type: "decision", label: "Tampil?" },
        tidakIn: "admin",
        persyaratan: "Uji login pengawas",
        waktu: "± 5 mnt",
        output: "Penugasan efektif",
        ket: "Ulangi assign bila Tidak",
      },
    ],
  },
  {
    id: "SOP-06 Manajemen Akses",
    lampiran: "LAMPIRAN VI",
    title: "PROSEDUR PELAKSANAAN MANAJEMEN AKSES (ADMIN)",
    steps: [
      {
        no: "1.",
        kegiatan: "Kelola Roles & Permissions.",
        roles: { admin: true },
        flow: { col: "admin", type: "process", label: "Role" },
        persyaratan: "Modul permissions",
        waktu: "± 15 mnt",
        output: "Role siap",
      },
      {
        no: "2.",
        kegiatan: "Atur Route & Menu Permissions.",
        roles: { admin: true },
        flow: { col: "admin", type: "red", label: "Route" },
        persyaratan: "Daftar route aplikasi",
        waktu: "± 20 mnt",
        output: "Akses terkontrol",
      },
      {
        no: "3.",
        kegiatan: "Tambah user & uji login.",
        roles: { admin: true },
        flow: { col: "admin", type: "decision", label: "Sesuai?" },
        tidakIn: "operator",
        persyaratan: "Akun uji coba",
        waktu: "± 10 mnt",
        output: "Hak akses benar",
        ket: "Perbaiki permission bila Tidak",
      },
    ],
  },
];

const body = `# SOP Penggunaan Arumanis & Panel Pengawasan

| Item | Nilai |
|:-----|:------|
| **Versi dokumen** | 1.0 |
| **Tanggal** | 1 Juli 2026 |
| **Platform** | Arumanis v0.5.0 |
| **Word** | \`docs/SOP_PENGGUNAAN_ARUMANIS.docx\` |
| **Excel** | \`docs/SOP_PENGGUNAAN_ARUMANIS.xlsx\` |
| **Regenerasi** | \`bun run docs:sop:md\` |

> Format mengikuti template SOP pemerintah: halaman pengesahan dua kolom + flowchart shape (kotak/diamond) di kolom **Pelaksana** dalam satu tabel terintegrasi.

---

## Halaman Pengesahan

${pengesahan()}

---

## Daftar Isi

| No | Lembar | Judul | Aplikasi |
|:---|:-------|:------|:---------|
| — | Halaman Pengesahan | Metadata & pengesahan SOP | — |
| 1 | SOP-01 Login & SSO | Akses & Autentikasi | Keduanya |
| 2 | SOP-02 Input Program | Input Program Baru | www/bun |
| 3 | SOP-03 Kontrak | Kontrak & Penyedia | www/bun |
| 4 | SOP-04 Pengawasan | Pemantauan Lapangan | www/pengawas |
| 5 | SOP-05 Penugasan | Penugasan Pengawas | Keduanya |
| 6 | SOP-06 Manajemen Akses | Role & Permission | www/bun |

**Legenda:** Kotak biru/merah = proses · Belah ketupat hijau = keputusan (Ya/Tidak) · Garis │▼ = alur · ● = pelaksana aktif

---

${SOPS.map((s) => `## ${s.id}\n\n${sopTable(s.lampiran, s.title, s.steps)}\n\n---\n`).join("\n")}

## Lampiran Referensi

| Dokumen | Lokasi |
|:--------|:-------|
| Panduan modul | [docs/user-guide/](user-guide/index.md) |
| Panel pengawasan | [docs/user-guide/pengawas-panel.md](user-guide/pengawas-panel.md) |
| Petunjuk teknis Word | \`docs/Petunjuk_Teknis_Aplikasi_Arumanis.docx\` |

| Regenerasi | Perintah |
|:-----------|:---------|
| Markdown | \`bun run docs:sop:md\` |
| Word | \`bun run docs:sop\` |
| Excel | \`bun run docs:sop:xlsx\` |

---

*Dokumen ini mengikuti format SOP pemerintah: halaman pengesahan berbingkai, tabel kegiatan + flowchart shape di kolom Pelaksana + Mutu Baku (Persyaratan, Waktu, Output).*
`;

writeFileSync(OUT, body, "utf8");
console.log(`✓ SOP Markdown tersimpan: ${OUT}`);