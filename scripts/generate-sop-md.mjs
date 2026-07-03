#!/usr/bin/env node
/**
 * Generate SOP Markdown — semua modul Arumanis, Puspen, Panel Pengawasan.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { ALL_SOPS, SOP_KETERANGAN } from "./sop-modules-data.mjs";

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

function shapeBottomY(flow, y) {
  if (flow?.type === "decision") return y + 26;
  return y + 17;
}

function shapeTopY(flow, y) {
  if (flow?.type === "decision") return y - 26;
  return y - 17;
}

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

function buildPelaksanaSvg(steps, slug) {
  const n = steps.length;
  const h = n * ROW_H;
  const mid = slug.replace(/-/g, "");

  const nodes = steps.map((step, i) => {
    const flow = step.flow;
    const col = flow?.col ?? "operator";
    return { x: COL_X[col], y: ROW_H / 2 + i * ROW_H, step, i, flow };
  });

  const arr = () => `marker-end="url(#arr-${mid})"`;

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

  for (let i = 0; i < nodes.length - 1; i++) {
    const a = nodes[i];
    const b = nodes[i + 1];
    body += connect(a.x, shapeBottomY(a.flow, a.y), b.x, shapeTopY(b.flow, b.y));
  }

  for (const node of nodes) {
    const { step, flow, x, y } = node;
    if (step.tidakIn && flow?.type === "decision") {
      const tx = COL_X[step.tidakIn];
      const xStart = x + (tx > x ? 24 : -24);
      body += `<path d="M${xStart} ${y} L${tx} ${y}" fill="none" stroke="${ARROW}" stroke-width="1.8"/>`;
      body += `<text x="${(xStart + tx) / 2}" y="${y - 5}" text-anchor="middle" font-size="9" font-weight="bold" fill="${ARROW}" font-family="Arial">Tidak</text>`;
      if (step.tidakLoopTo != null) {
        const target = nodes[step.tidakLoopTo];
        if (target) {
          body += `<path d="M${tx} ${y} L${tx} ${shapeTopY(target.flow, target.y)}" fill="none" stroke="${ARROW}" stroke-width="1.5" stroke-dasharray="4,3" ${arr()}/>`;
        }
      }
    }
    body += drawShape(flow, x, y);
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

function sopTable(sop) {
  const { lampiran, title, steps, slug, route } = sop;
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

  const routeLine = route && route !== "—" ? `<p style="${FONT}margin:4px 0;"><strong>Route:</strong> <code>${esc(route)}</code></p>` : "";

  return `${routeLine}<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;${FONT}">
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
<tr>${cell("BIDANG AIR MINUM DAN SANITASI")}${cell(`<table width="100%" border="0" cellpadding="2">${metaRow("Tgl Pembuatan", "1 Juli 2026")}</table>`)}</tr>
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
          "Admin/Operator: mampu mengelola master data, kontrak, dokumentasi, dan akses.",
          "Pengawas: mampu mengisi foto ber-GPS, progress, laporan mingguan, dan tiket lapangan.",
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

const body = `# SOP Penggunaan Arumanis & Panel Pengawasan

| Item | Nilai |
|:-----|:------|
| **Versi dokumen** | 1.1 |
| **Tanggal** | 1 Juli 2026 |
| **Platform** | Arumanis v0.5.0 |
| **Total SOP** | ${ALL_SOPS.length} lembar |
| **Word** | \`docs/SOP_PENGGUNAAN_ARUMANIS.docx\` |
| **Excel** | \`docs/SOP_PENGGUNAAN_ARUMANIS.xlsx\` |
| **Regenerasi** | \`bun run docs:sop:md\` |

> Format template pemerintah: halaman pengesahan + tabel kegiatan + flowchart SVG (shape & garis penghubung) di kolom **Pelaksana**. Mencakup **semua modul** sidebar Arumanis, Puspen, dan Panel Pengawasan.

---

## Halaman Pengesahan

${pengesahan()}

---

## Daftar Isi

${daftarIsi()}

**Legenda:** Kotak biru/merah = proses · Belah ketupat hijau = keputusan · Garis biru + panah = alur · Garis putus-putus = loop Tidak

---

${sopSections()}

## Lampiran Referensi

| Dokumen | Lokasi |
|:--------|:-------|
| Panduan modul | [docs/user-guide/](user-guide/index.md) |
| Panel pengawasan | [docs/user-guide/pengawas-panel.md](user-guide/pengawas-panel.md) |
| Flowchart SVG | [docs/sop-flow/](sop-flow/) |
| Sidebar modul | \`src/components/layout/data/sidebar-data.ts\` |

| Regenerasi | Perintah |
|:-----------|:---------|
| Markdown | \`bun run docs:sop:md\` |
| Word | \`bun run docs:sop\` |
| Excel | \`bun run docs:sop:xlsx\` |

---

*${ALL_SOPS.length} SOP — satu lembar per modul/alur. Shape dan garis penghubung dirender sebagai SVG di area Pelaksana.*
`;

writeFileSync(OUT, body, "utf8");
console.log(`✓ SOP Markdown tersimpan: ${OUT} (${ALL_SOPS.length} lembar)`);
console.log(`✓ SVG flowchart: ${FLOW_DIR}`);