#!/usr/bin/env python3
"""Generate SOP Excel — 65 lembar, selaras dengan SOP-PENGGUNAAN-ARUMANIS.md / .docx."""

from __future__ import annotations

import json
import re
from pathlib import Path

import xlsxwriter

ROOT = Path(__file__).resolve().parent.parent
JSON_PATH = Path(__file__).resolve().parent / ".sop-export.json"
PNG_DIR = ROOT / "docs" / "sop-flow-png"
OUT = ROOT / "docs" / "SOP_PENGGUNAAN_ARUMANIS.xlsx"

SUBTITLE = (
    "Standar Operasional Prosedur (SOP) Penggunaan Aplikasi ARUMANIS "
    "dan Panel Pengawasan — Satu Data Air Minum dan Sanitasi Kabupaten Cianjur"
)
ROW_H = 58.5  # points = 78px @ 96dpi, selaras baris tabel
PEL_COL_CHARS = [6, 6, 6, 6]  # kolom C–F Pelaksana


def border_fmt(wb, **kw):
    base = {"font_name": "Arial", "font_size": 9, "valign": "vcenter", "text_wrap": True, "border": 1}
    base.update(kw)
    return wb.add_format(base)


def safe_sheet_name(num: int, sop_id: str) -> str:
    base = sop_id.replace("SOP-", "", 1).strip()
    name = f"{num:02d} {base}"
    name = re.sub(r"[\[\]:*?/\\]", "-", name)
    return name[:31]


def load_data() -> dict:
    if not JSON_PATH.exists():
        raise SystemExit(f"JSON tidak ditemukan: {JSON_PATH}\nJalankan: node scripts/export-sop-json.mjs")
    return json.loads(JSON_PATH.read_text(encoding="utf-8"))


def sheet_pengesahan(wb, data: dict):
    ws = wb.add_worksheet("Halaman Pengesahan")
    ws.set_paper(9)
    ws.set_portrait()
    ws.set_column(0, 0, 2)
    ws.set_column(1, 5, 14)
    ws.set_column(6, 6, 2)
    ws.set_column(7, 11, 14)

    thin = border_fmt(wb)
    bold = border_fmt(wb, bold=True)
    bold_c = border_fmt(wb, bold=True, align="center")
    center = border_fmt(wb, align="center")
    title = border_fmt(wb, bold=True, align="center", font_size=12)
    label = border_fmt(wb, bold=True, align="right")
    val = border_fmt(wb, align="left")

    ws.merge_range("B1:F2", "DINAS PEKERJAAN UMUM DAN TATA RUANG\nKABUPATEN CIANJUR", bold_c)
    ws.merge_range("B3:F3", "BIDANG AIR MINUM DAN SANITASI", bold_c)
    ws.merge_range("B4:F6", "SEKSI PERENCANAAN DAN PENGEMBANGAN SISTEM INFORMASI", center)

    meta = [
        ("Nama SOP", "SOP Penggunaan Arumanis & Panel Pengawasan"),
        ("Tgl Pembuatan", "1 Juli 2026"),
        ("Tanggal Revisi", "—"),
        ("Tanggal Aktif", "1 Juli 2026"),
        ("Disahkan oleh", "Kepala Bidang Air Minum dan Sanitasi"),
    ]
    for i, (k, v) in enumerate(meta):
        ws.write(i, 7, k, label)
        ws.merge_range(i, 8, i, 11, v, val)

    ws.merge_range("B8:F10", "SOP PENGGUNAAN APLIKASI ARUMANIS\nDAN PANEL PENGAWASAN", title)
    ws.merge_range("H8:K8", "Tanda Tangan dan Stempel", center)
    ws.merge_range("H9:K11", "", thin)

    dasar = (
        "1. Undang-Undang Nomor 25 Tahun 2009 tentang Pelayanan Publik.\n"
        "2. Peraturan Menteri Dalam Negeri Nomor 57 Tahun 2007 tentang "
        "Petunjuk Teknis Penataan Organisasi Perangkat Daerah.\n"
        "3. Peraturan Bupati Cianjur tentang Standar Pelayanan Minimum "
        "Air Minum dan Sanitasi.\n"
        "4. Keputusan Kepala Dinas terkait pembentukan SOP operasional "
        "sistem informasi ARUMANIS."
    )
    kualifikasi = (
        "1. Memahami tugas dan fungsi Bidang Air Minum dan Sanitasi.\n"
        "2. Memahami alur kerja aplikasi ARUMANIS (www/bun) dan Panel "
        "Pengawasan (www/pengawas).\n"
        "3. Admin/Operator: mampu mengelola master data, kontrak, dokumentasi, dan akses.\n"
        "4. Pengawas: mampu mengisi foto ber-GPS, progress, laporan mingguan, dan tiket lapangan."
    )
    ket = "\n".join(f"{i + 1}. {line}" for i, line in enumerate(data.get("keterangan", [])))
    alat = (
        "1. Perangkat komputer / laptop / tablet.\n"
        "2. Browser Chrome, Firefox, atau Edge versi terbaru.\n"
        "3. Koneksi internet stabil.\n"
        "4. Akun APIAMIS aktif (email & password).\n"
        "5. GPS perangkat (untuk upload foto lapangan).\n"
        "6. ATK (bila mencetak dokumentasi foto PDF)."
    )
    peringatan = (
        "1. Setiap pengguna wajib menjaga kerahasiaan akun dan password.\n"
        "2. Data yang diinput harus sesuai kondisi di lapangan.\n"
        "3. Foto dokumentasi wajib memuat koordinat GPS dalam batas desa pekerjaan.\n"
        "4. Progress mingguan wajib diisi sebelum batas waktu yang ditetapkan unit.\n"
        "5. Dilarang menambahkan trailer Co-authored-by bot/AI pada commit sistem."
    )
    pencatatan = (
        "1. Database APIAMIS (backend Laravel).\n"
        "2. Audit Trail di modul /audit-logs (Arumanis).\n"
        "3. Berkas digital di modul Berkas & Drive 3-zona.\n"
        "4. Dokumentasi foto slot 0%–100% di Panel Pengawasan.\n"
        "5. Tiket dan notifikasi sebagai jejak tindak lanjut."
    )

    start = 11
    ws.merge_range(start, 1, start, 5, "Dasar Hukum", bold)
    ws.merge_range(start, 7, start, 11, "Kualifikasi Pelaksana", bold)
    ws.merge_range(start + 1, 1, start + 6, 5, dasar, thin)
    ws.merge_range(start + 1, 7, start + 6, 11, kualifikasi, thin)
    ws.merge_range(start + 7, 1, start + 7, 5, "Keterangan", bold)
    ws.merge_range(start + 7, 7, start + 7, 11, "Peralatan / Perlengkapan", bold)
    ws.merge_range(start + 8, 1, start + 14, 5, ket, thin)
    ws.merge_range(start + 8, 7, start + 14, 11, alat, thin)
    ws.merge_range(start + 15, 1, start + 15, 5, "Peringatan", bold)
    ws.merge_range(start + 15, 7, start + 15, 11, "Pencatatan dan Pendataan", bold)
    ws.merge_range(start + 16, 1, start + 22, 5, peringatan, thin)
    ws.merge_range(start + 16, 7, start + 22, 11, pencatatan, thin)


def sheet_index(wb, data: dict):
    ws = wb.add_worksheet("Daftar Isi")
    fmt_t = border_fmt(wb, bold=True, align="center", font_size=13, bg_color="#BDD7EE")
    fmt_h = border_fmt(wb, bold=True, align="center", bg_color="#D9E1F2")
    fmt_c = border_fmt(wb)
    ws.set_column(0, 0, 5)
    ws.set_column(1, 1, 22)
    ws.set_column(2, 2, 42)
    ws.set_column(3, 3, 22)
    ws.set_column(4, 4, 14)

    ws.merge_range(0, 0, 0, 4, "DAFTAR ISI — SOP ARUMANIS & PANEL PENGAWASAN", fmt_t)
    meta = [
        ("Versi", data.get("version", "1.1")),
        ("Platform", "Arumanis v0.5.0"),
        ("Tanggal", data.get("date", "1 Juli 2026")),
        ("Total SOP", f"{data.get('total', 0)} lembar"),
        ("Regenerasi", "bun run docs:sop:xlsx"),
    ]
    r = 2
    for k, v in meta:
        ws.write(r, 0, k, border_fmt(wb, bold=True))
        ws.merge_range(r, 1, r, 4, v, fmt_c)
        r += 1
    r += 1
    headers = ["No", "Lembar", "Judul", "Route", "Aplikasi"]
    for c, h in enumerate(headers):
        ws.write(r, c, h, fmt_h)
    r += 1
    ws.write_row(r, 0, ["—", "Halaman Pengesahan", "Metadata & pengesahan SOP", "—", "—"], fmt_c)
    r += 1
    for sop in data["sops"]:
        title = sop["title"].replace("PROSEDUR PELAKSANAAN ", "")
        ws.write(r, 0, f"{sop['num']:02d}", border_fmt(wb, align="center"))
        ws.write(r, 1, sop["id"], fmt_c)
        ws.write(r, 2, title, fmt_c)
        ws.write(r, 3, sop.get("route") or "—", fmt_c)
        ws.write(r, 4, sop.get("app") or "—", border_fmt(wb, align="center"))
        r += 1


def write_sop_sheet(wb, sop: dict, png_path: Path | None):
    name = safe_sheet_name(sop["num"], sop["id"])
    ws = wb.add_worksheet(name)
    ws.set_landscape()
    ws.set_paper(9)
    ws.fit_to_pages(1, 0)
    ws.set_margins(0.35, 0.35, 0.45, 0.45)

    widths = [4, 34, *PEL_COL_CHARS, 17, 9, 17, 15]
    for i, w in enumerate(widths):
        ws.set_column(i, i, w)

    fmt_title = border_fmt(wb, bold=True, align="center", font_size=12, bg_color="#BDD7EE")
    fmt_hdr = border_fmt(wb, bold=True, align="center", bg_color="#D9E1F2")
    fmt_cell = border_fmt(wb, valign="top")
    fmt_center = border_fmt(wb, align="center", valign="top")
    fmt_pelaksana = border_fmt(wb, align="center", valign="top", bg_color="#FAFAFA")

    r = 0
    ws.merge_range(r, 0, r, 9, sop.get("lampiran", "LAMPIRAN"), fmt_title)
    r += 1
    ws.merge_range(r, 0, r, 9, SUBTITLE, border_fmt(wb, align="center", font_size=9))
    ws.set_row(r, 36)
    r += 1
    ws.merge_range(
        r,
        0,
        r,
        9,
        "Nomor : ....................................          Tanggal : 1 Juli 2026",
        border_fmt(wb, align="center"),
    )
    r += 1
    ws.merge_range(r, 0, r, 9, sop["title"], fmt_title)
    ws.set_row(r, 28)
    r += 1

    route = sop.get("route")
    if route and route != "—":
        ws.merge_range(r, 0, r, 9, f"Route: {route}", border_fmt(wb, align="left"))
        r += 1

    hdr = r
    ws.merge_range(hdr, 0, hdr + 1, 0, "No.", fmt_hdr)
    ws.merge_range(hdr, 1, hdr + 1, 1, "Kegiatan", fmt_hdr)
    ws.merge_range(hdr, 2, hdr, 5, "Pelaksana", fmt_hdr)
    ws.merge_range(hdr, 6, hdr, 8, "Mutu Baku", fmt_hdr)
    ws.merge_range(hdr, 9, hdr + 1, 9, "Ket", fmt_hdr)
    for i, label in enumerate(["Admin", "Operator", "Pengawas", "Sistem"]):
        ws.write(hdr + 1, 2 + i, label, fmt_hdr)
    for i, label in enumerate(["Persyaratan / Kelengkapan", "Waktu", "Output"]):
        ws.write(hdr + 1, 6 + i, label, fmt_hdr)
    ws.set_row(hdr, 22)
    ws.set_row(hdr + 1, 22)
    r = hdr + 2

    steps = sop["steps"]
    if not steps:
        return

    data_start = r
    data_end = r + len(steps) - 1
    ws.merge_range(data_start, 2, data_end, 5, "", fmt_pelaksana)

    for step in steps:
        ws.write(r, 0, step.get("no", ""), fmt_center)
        ws.write(r, 1, step.get("kegiatan", ""), fmt_cell)
        ws.write(r, 6, step.get("persyaratan") or step.get("kategori") or "", fmt_cell)
        ws.write(r, 7, step.get("waktu") or "", fmt_center)
        ws.write(r, 8, step.get("output") or "", fmt_cell)
        ws.write(r, 9, step.get("ket") or "", fmt_cell)
        ws.set_row(r, ROW_H)
        r += 1

    if png_path and png_path.exists():
        # Place in Cell (Excel 365+) — gambar menempel di sel merge C:F, bukan overlay mengambang.
        # PNG di-render tepat ukuran area merge (lihat prepare-sop-flow-png.mjs).
        ws.embed_image(
            data_start,
            2,
            str(png_path),
            {"cell_format": fmt_pelaksana},
        )


def main():
    data = load_data()
    OUT.parent.mkdir(parents=True, exist_ok=True)
    try:
        out_path = OUT
        wb = xlsxwriter.Workbook(str(out_path))
    except xlsxwriter.exceptions.FileCreateError:
        out_path = OUT.with_stem(OUT.stem + "_baru")
        wb = xlsxwriter.Workbook(str(out_path))

    sheet_index(wb, data)
    sheet_pengesahan(wb, data)

    png_ok = 0
    for sop in data["sops"]:
        png = PNG_DIR / f"{sop['slug']}.png"
        if png.exists():
            png_ok += 1
        write_sop_sheet(wb, sop, png if png.exists() else None)

    wb.close()
    print(f"✓ SOP Excel tersimpan: {out_path} ({data['total']} lembar)")
    print(f"  Flowchart PNG: {png_ok}/{data['total']} dari docs/sop-flow-png/")


if __name__ == "__main__":
    main()