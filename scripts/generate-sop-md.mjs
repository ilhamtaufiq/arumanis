#!/usr/bin/env node
/**
 * Generate SOP Markdown — format pemerintah (contoh sop.png)
 * Shape + garis penghubung (panah) di area Pelaksana via SVG overlay.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = resolve(ROOT, "docs/SOP-PENGGUNAAN-ARUMANIS.md");
const FLOW_DIR = resolve(ROOT, "docs/sop-flow");

const B = "border:1px solid #000;";
const FONT = "font-family:Arial,Helvetica,sans-serif;font-size:11px;";
const TH = `style="${B}background:#D9E1F2;font-weight:bold;text-align:center;padding:6px;${FONT}"`;
const TD = `style="${B}padding:6px;vertical-align:top;${FONT}"`;
const TDC = `style="${B}padding:6px;text-align:center;vertical-align:middle;${FONT}"`;
const TITLE = `style="${B}background:#BDD7EE;font-weight:bold;text-align:center;padding:8px;font-size:12px;${FONT}"`;

const ROW_H = 78;
const SVG_W = 320;
const COL_X = { admin: 40, operator: 120, pengawas: 200, sistem: 280 };
const ARROW = "#2F5597";

const esc = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

function drawShape(flow, x, y) {
  if (!flow) return "";
  if (flow.type === "decision") {
    const s = 26;
    return `<g>
      <polygon points="${x},${y - s} ${x + s},${y} ${x},${y + s} ${x - s},${y}" fill="#C6E0B4" stroke="#000" stroke-width="1.5"/>
      <text x="${x}" y="${y + 4}" text-anchor="middle" font-size="8" font-weight="bold" font-family="Arial">${esc(flow.label)}</text>
      <text x="${x}" y="${y + s + 14}" text-anchor="middle" font-size="8" font-weight="bold" fill="${ARROW}" font-family="Arial">Ya</text>
    </g>`;
  }
  const color = flow.type === "red" ? "#E74C3C" : flow.color || "#5B9BD5";
  const w = 62;
  const h = 34;
  return `<g>
    <rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="4" fill="${color}" stroke="#000" stroke-width="1.5"/>
    <text x="${x}" y="${y + 4}" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="Arial">${esc(flow.label)}</text>
  </g>`;
}

function shapeBottomY(flow, y) {
  if (flow?.type === "decision") return y + 26;
  return y + 17;
}

function shapeTopY(flow, y) {
  if (flow?.type === "decision") return y - 26;
  return y - 17;
}

/** SVG flowchart dengan garis penghubung antar shape di grid Pelaksana */
function buildPelaksanaSvg(steps, slug) {
  const n = steps.length;
  const h = n * ROW_H;
  const mid = slug.replace(/-/g, "");

  const nodes = steps.map((step, i) => {
    const flow = step.flow;
    const col = flow?.col ?? "operator";
    return { x: COL_X[col], y: ROW_H / 2 + i * ROW_H, step, i, flow };
  });

  const arr = (extra = "") => `marker-end="url(#arr-${mid}${extra})"`;

  let body = `<defs>
    <marker id="arr-${mid}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="${ARROW}"/>
    </marker>
  </defs>`;

  const connect = (x1, y1, x2, y2) => {
    if (Math.abs(x1 - x2) < 3) {
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${ARROW}" stroke-width="2" ${arr()}/>`;
    }
    const midY = (y1 + y2) / 2;
    return `<path d="M${x1} ${y1} L${x1} ${midY} L${x2} ${midY} L${x2} ${y2}" fill="none" stroke="${ARROW}" stroke-width="2" ${arr()}/>`;
  };

  // Garis penghubung antar langkah (jalur Ya / alur utama)
  for (let i = 0; i < nodes.length - 1; i++) {
    const a = nodes[i];
    const b = nodes[i + 1];
    body += connect(a.x, shapeBottomY(a.flow, a.y), b.x, shapeTopY(b.flow, b.y));
  }

  // Cabang Tidak (horizontal ke kolom tidakIn)
  for (const node of nodes) {
    const { step, flow, x, y } = node;
    if (step.tidakIn && flow?.type === "decision") {
      const tx = COL_X[step.tidakIn];
      const hy = y;
      const xStart = x + (tx > x ? 24 : -24);
      body += `<path d="M${xStart} ${hy} L${tx} ${hy}" fill="none" stroke="${ARROW}" stroke-width="1.8"/>`;
      body += `<text x="${(xStart + tx) / 2}" y="${hy - 5}" text-anchor="middle" font-size="9" font-weight="bold" fill="${ARROW}" font-family="Arial">Tidak</text>`;
      // Panah ke atas untuk loop ulang (langkah sebelumnya)
      if (step.tidakLoopTo != null) {
        const target = nodes[step.tidakLoopTo];
        if (target) {
          const loopX = tx;
          body += `<path d="M${loopX} ${hy} L${loopX} ${shapeTopY(target.flow, target.y)}" fill="none" stroke="${ARROW}" stroke-width="1.5" stroke-dasharray="4,3" ${arr()}/>`;
        }
      }
    }
  }

  for (const node of nodes) {
    body += drawShape(node.flow, node.x, node.y);
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="${h}" viewBox="0 0 ${SVG_W} ${h}" preserveAspectRatio="xMidYMid meet" style="position:absolute;top:0;left:0;z-index:2;pointer-events:none">${body}</svg>`;
}

function pelaksanaGrid(steps) {
  const rows = steps
    .map(
      () => `<tr style="height:${ROW_H}px">
    <td style="${B}width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="${B}width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="${B}width:25%;border-right:1px solid #000;border-bottom:1px solid #000">&nbsp;</td>
    <td style="${B}width:25%;border-bottom:1px solid #000">&nbsp;</td>
  </tr>`,
    )
    .join("\n");
  return `<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;position:absolute;top:0;left:0;z-index:1;height:100%;table-layout:fixed">${rows}</table>`;
}

function sopTable(lampiran, title, steps, slug) {
  const svg = buildPelaksanaSvg(steps, slug);
  const grid = pelaksanaGrid(steps);
  const totalH = steps.length * ROW_H;

  mkdirSync(FLOW_DIR, { recursive: true });
  const svgFile = `sop-flow/${slug}.svg`;
  const standalone = svg.replace('style="position:absolute;top:0;left:0;z-index:2;pointer-events:none"', "");
  writeFileSync(resolve(ROOT, "docs", svgFile), `<?xml version="1.0" encoding="UTF-8"?>\n${standalone}`, "utf8");

  const pelaksanaBlock = `<td colspan="4" rowspan="${steps.length}" style="${B}padding:0;vertical-align:top;position:relative;min-width:240px">
  <div style="position:relative;width:100%;min-height:${totalH}px">
    ${svg}
    ${grid}
  </div>
</td>`;

  const rows = steps
    .map((step, i) => {
      const pel = i === 0 ? pelaksanaBlock : "";
      return `<tr style="height:${ROW_H}px">
  <td ${TDC}>${esc(step.no)}</td>
  <td ${TD}>${esc(step.kegiatan)}</td>
  ${pel}
  <td ${TD}>${esc(step.persyaratan ?? step.kategori ?? "")}</td>
  <td ${TDC}>${esc(step.waktu ?? "")}</td>
  <td ${TD}>${esc(step.output ?? "")}</td>
  <td ${TD}>${esc(step.ket ?? "")}</td>
</tr>`;
    })
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
  <td ${TH}>Admin</td>
  <td ${TH}>Operator</td>
  <td ${TH}>Pengawas</td>
  <td ${TH}>Sistem</td>
  <td ${TH}>Persyaratan / Kelengkapan</td>
  <td ${TH}>Waktu</td>
  <td ${TH}>Output</td>
</tr>
${rows}
</table>
<p style="${FONT}color:#666;font-size:10px;"><em>Flowchart SVG: <a href="${svgFile}">${svgFile}</a></em></p>`;
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
<tr>${cell(`<table width="100%" border="0" cellpadding="2">${metaRow("Tanggal Aktif", "1 Juli 2026")}</table>`)}</tr>
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
    slug: "sop-01-login",
    lampiran: "LAMPIRAN I",
    title: "PROSEDUR PELAKSANAAN AKSES & AUTENTIKASI ARUMANIS / PANEL PENGAWASAN",
    steps: [
      {
        no: "1.",
        kegiatan: "Pengguna membuka URL Arumanis di browser terbaru.",
        flow: { col: "operator", type: "process", label: "User" },
        persyaratan: "Browser terbaru, koneksi internet",
        waktu: "± 2 menit",
        output: "Halaman /sign-in",
      },
      {
        no: "2.",
        kegiatan: "Masukkan email & password APIAMIS lalu Sign In.",
        flow: { col: "operator", type: "process", label: "Login" },
        persyaratan: "Akun APIAMIS aktif",
        waktu: "± 1 menit",
        output: "Sesi cookie terbentuk",
      },
      {
        no: "3.",
        kegiatan: "Sistem validasi kredensial via BFF → APIAMIS. Gagal: ulangi login.",
        flow: { col: "sistem", type: "decision", label: "Berhasil?" },
        tidakIn: "operator",
        tidakLoopTo: 1,
        persyaratan: "Kredensial benar",
        waktu: "Real-time",
        output: "Token valid / error",
        ket: "Ulangi langkah 2 bila Tidak",
      },
      {
        no: "4.",
        kegiatan: "Cek role: Admin/Operator/Viewer → Dashboard; Pengawas → SSO panel.",
        flow: { col: "sistem", type: "red", label: "Cek Role" },
        persyaratan: "Role terdaftar di APIAMIS",
        waktu: "Real-time",
        output: "Halaman tujuan",
      },
      {
        no: "5.",
        kegiatan: "SSO pengawas: /pengawasan/login?token → cookie pengawas_session.",
        flow: { col: "pengawas", type: "process", label: "SSO" },
        persyaratan: "Token SSO valid",
        waktu: "± 30 dtk",
        output: "Dashboard /pengawasan/",
        ket: "Tanpa login terpisah",
      },
      {
        no: "6.",
        kegiatan: "Operasional sesuai SOP modul. Logout via avatar → Logout.",
        flow: { col: "operator", type: "process", label: "Selesai" },
        persyaratan: "—",
        waktu: "Sesuai tugas",
        output: "Sesi berakhir",
      },
    ],
  },
  {
    id: "SOP-02 Input Program",
    slug: "sop-02-program",
    lampiran: "LAMPIRAN II",
    title: "PROSEDUR PELAKSANAAN INPUT PROGRAM BARU (ARUMANIS UTAMA)",
    steps: [
      {
        no: "1.",
        kegiatan: "Login → buka /kegiatan.",
        flow: { col: "operator", type: "process", label: "Kegiatan" },
        persyaratan: "Hak akses modul kegiatan",
        waktu: "± 15 mnt",
        output: "Master kegiatan",
      },
      {
        no: "2.",
        kegiatan: "Tambah kegiatan: nama, kode, dana, pagu, TA.",
        flow: { col: "operator", type: "process", label: "Tambah" },
        persyaratan: "Data pagu & TA",
        waktu: "± 10 mnt",
        output: "Kegiatan tersimpan",
      },
      {
        no: "3.",
        kegiatan: "Tambah pekerjaan: kegiatan, kecamatan, desa, pagu.",
        flow: { col: "operator", type: "red", label: "Pekerjaan" },
        persyaratan: "Master wilayah desa",
        waktu: "± 15 mnt",
        output: "Pekerjaan aktif",
      },
      {
        no: "4.",
        kegiatan: "Tambah output & penerima per pekerjaan.",
        flow: { col: "operator", type: "process", label: "Output" },
        persyaratan: "RAB / komponen",
        waktu: "± 20 mnt",
        output: "Komponen tercatat",
      },
      {
        no: "5.",
        kegiatan: "Upload berkas & foto awal (opsional).",
        flow: { col: "operator", type: "process", label: "Berkas" },
        persyaratan: "File digital",
        waktu: "± 15 mnt",
        output: "File terunggah",
      },
      {
        no: "6.",
        kegiatan: "Verifikasi dashboard & data quality. Tidak lengkap → perbaiki.",
        flow: { col: "admin", type: "decision", label: "Lengkap?" },
        tidakIn: "operator",
        tidakLoopTo: 2,
        persyaratan: "Dashboard data quality",
        waktu: "± 5 mnt",
        output: "Data siap",
        ket: "Perbaiki data bila Tidak",
      },
    ],
  },
  {
    id: "SOP-03 Kontrak",
    slug: "sop-03-kontrak",
    lampiran: "LAMPIRAN III",
    title: "PROSEDUR PELAKSANAAN KONTRAK & PENYEDIA",
    steps: [
      {
        no: "1.",
        kegiatan: "Pastikan pekerjaan & penyedia terdaftar.",
        flow: { col: "operator", type: "process", label: "Prasyarat" },
        persyaratan: "Master pekerjaan & penyedia",
        waktu: "± 10 mnt",
        output: "Data induk siap",
      },
      {
        no: "2.",
        kegiatan: "Buat kontrak: pekerjaan, penyedia, nilai, tanggal.",
        flow: { col: "operator", type: "red", label: "Kontrak" },
        persyaratan: "Dokumen kontrak",
        waktu: "± 20 mnt",
        output: "Kontrak aktif",
      },
      {
        no: "3.",
        kegiatan: "Addendum & register dokumen bila diperlukan.",
        flow: { col: "operator", type: "decision", label: "Addendum?" },
        tidakIn: "admin",
        persyaratan: "Register dokumen",
        waktu: "Sesuai kebutuhan",
        output: "Dokumen sinkron",
      },
      {
        no: "4.",
        kegiatan: "Verifikasi status kontrak di dashboard.",
        flow: { col: "admin", type: "process", label: "Selesai" },
        persyaratan: "Dashboard kontrak",
        waktu: "± 5 mnt",
        output: "Siap ditugaskan",
      },
    ],
  },
  {
    id: "SOP-04 Pengawasan",
    slug: "sop-04-pengawasan",
    lampiran: "LAMPIRAN IV",
    title: "PROSEDUR PELAKSANAAN PEMANTAUAN LAPANGAN (PANEL PENGAWASAN)",
    steps: [
      {
        no: "1.",
        kegiatan: "Login SSO → Dashboard /pengawasan/.",
        flow: { col: "pengawas", type: "process", label: "SSO Login" },
        persyaratan: "Akun & penugasan aktif",
        waktu: "± 2 mnt",
        output: "KPI tampil",
      },
      {
        no: "2.",
        kegiatan: "Baca KPI & buka paket perlu perhatian.",
        flow: { col: "pengawas", type: "process", label: "Dashboard" },
        persyaratan: "Dashboard pengawasan",
        waktu: "Harian",
        output: "Prioritas paket",
      },
      {
        no: "3.",
        kegiatan: "Tab Penerima: kelola penerima individu/komunal.",
        flow: { col: "pengawas", type: "red", label: "Penerima" },
        persyaratan: "Data penerima",
        waktu: "Per paket",
        output: "Penerima lengkap",
      },
      {
        no: "4.",
        kegiatan: "Tab Foto: upload slot 0–100% + GPS per output.",
        flow: { col: "pengawas", type: "process", label: "Foto GPS" },
        persyaratan: "GPS aktif, foto lapangan",
        waktu: "Per kunjungan",
        output: "Matriks foto terisi",
      },
      {
        no: "5.",
        kegiatan: "Tab Progress / Buat Laporan: rencana & realisasi mingguan.",
        flow: { col: "pengawas", type: "process", label: "Progress" },
        persyaratan: "Form progress mingguan",
        waktu: "Mingguan",
        output: "Deviasi terupdate",
      },
      {
        no: "6.",
        kegiatan: "Ada kendala? Buat tiket. Tidak → selesai.",
        flow: { col: "pengawas", type: "decision", label: "Kendala?" },
        tidakIn: "sistem",
        persyaratan: "Modul tiket",
        waktu: "Sesuai kejadian",
        output: "Tiket / selesai",
      },
      {
        no: "7.",
        kegiatan: "Data tersinkron ke Arumanis via APIAMIS.",
        flow: { col: "sistem", type: "process", label: "Sinkron" },
        persyaratan: "APIAMIS aktif",
        waktu: "Real-time",
        output: "Data kantor = lapangan",
      },
    ],
  },
  {
    id: "SOP-05 Penugasan",
    slug: "sop-05-penugasan",
    lampiran: "LAMPIRAN V",
    title: "PROSEDUR PELAKSANAAN PENUGASAN PENGAWAS",
    steps: [
      {
        no: "1.",
        kegiatan: "Admin: master /pengawas (NIP benar).",
        flow: { col: "admin", type: "process", label: "Pengawas" },
        persyaratan: "Data NIP valid",
        waktu: "± 10 mnt",
        output: "Data valid",
      },
      {
        no: "2.",
        kegiatan: "User punya role pengawas di /users.",
        flow: { col: "admin", type: "red", label: "User" },
        persyaratan: "Role pengawas",
        waktu: "± 5 mnt",
        output: "Role aktif",
      },
      {
        no: "3.",
        kegiatan: "Assign pekerjaan di /user-pekerjaan.",
        flow: { col: "admin", type: "process", label: "Assign" },
        persyaratan: "Daftar pekerjaan",
        waktu: "± 15 mnt",
        output: "Paket di dashboard",
        ket: "Wajib",
      },
      {
        no: "4.",
        kegiatan: "Pengawas login: paket tampil? Tidak → ulangi assign.",
        flow: { col: "pengawas", type: "decision", label: "Tampil?" },
        tidakIn: "admin",
        tidakLoopTo: 2,
        persyaratan: "Uji login pengawas",
        waktu: "± 5 mnt",
        output: "Penugasan efektif",
        ket: "Ulangi assign bila Tidak",
      },
    ],
  },
  {
    id: "SOP-06 Manajemen Akses",
    slug: "sop-06-akses",
    lampiran: "LAMPIRAN VI",
    title: "PROSEDUR PELAKSANAAN MANAJEMEN AKSES (ADMIN)",
    steps: [
      {
        no: "1.",
        kegiatan: "Kelola Roles & Permissions.",
        flow: { col: "admin", type: "process", label: "Role" },
        persyaratan: "Modul permissions",
        waktu: "± 15 mnt",
        output: "Role siap",
      },
      {
        no: "2.",
        kegiatan: "Atur Route & Menu Permissions.",
        flow: { col: "admin", type: "red", label: "Route" },
        persyaratan: "Daftar route aplikasi",
        waktu: "± 20 mnt",
        output: "Akses terkontrol",
      },
      {
        no: "3.",
        kegiatan: "Tambah user & uji login.",
        flow: { col: "admin", type: "decision", label: "Sesuai?" },
        tidakIn: "operator",
        tidakLoopTo: 1,
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

> Format mengikuti template SOP pemerintah: shape di kolom **Pelaksana** dengan **garis penghubung** (panah biru) antar langkah, cabang **Ya/Tidak**.

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

**Legenda:** Kotak biru/merah = proses · Belah ketupat hijau = keputusan · Garis biru + panah = alur · Garis putus-putus = loop Tidak

---

${SOPS.map((s) => `## ${s.id}\n\n${sopTable(s.lampiran, s.title, s.steps, s.slug)}\n\n---\n`).join("\n")}

## Lampiran Referensi

| Dokumen | Lokasi |
|:--------|:-------|
| Panduan modul | [docs/user-guide/](user-guide/index.md) |
| Panel pengawasan | [docs/user-guide/pengawas-panel.md](user-guide/pengawas-panel.md) |
| Flowchart SVG | [docs/sop-flow/](sop-flow/) |

| Regenerasi | Perintah |
|:-----------|:---------|
| Markdown | \`bun run docs:sop:md\` |
| Word | \`bun run docs:sop\` |
| Excel | \`bun run docs:sop:xlsx\` |

---

*Shape dan garis penghubung dirender sebagai SVG di area Pelaksana (buka preview HTML/Markdown di VS Code atau browser).*
`;

writeFileSync(OUT, body, "utf8");
console.log(`✓ SOP Markdown tersimpan: ${OUT}`);
console.log(`✓ SVG flowchart: ${FLOW_DIR}`);