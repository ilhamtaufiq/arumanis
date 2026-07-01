#!/usr/bin/env python3
"""Generate FLOWCHART SOP Excel — shape flowchart + halaman pengesahan."""

from __future__ import annotations

import shutil
import tempfile
from pathlib import Path

import matplotlib.pyplot as plt
import xlsxwriter
from matplotlib.patches import FancyArrowPatch, FancyBboxPatch, Polygon

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "docs" / "SOP_PENGGUNAAN_ARUMANIS.xlsx"

ORANGE = "#F4B183"
DECISION = "#C6E0B4"
PROCESS = "#FFE699"
ARROW = "#2F5597"
MARK = "●"


# ---------------------------------------------------------------------------
# Flowchart shape renderer (PNG → insert_image, bukan teks garis)
# ---------------------------------------------------------------------------

class FlowRenderer:
    def __init__(self, tmp: Path):
        self.tmp = tmp
        self.counter = 0

    def _path(self) -> str:
        self.counter += 1
        return str(self.tmp / f"flow_{self.counter:03d}.png")

    def process(self, label: str, *, fill: str = ORANGE, arrow: bool = True) -> str:
        path = self._path()
        fig, ax = plt.subplots(figsize=(2.4, 0.85))
        ax.set_xlim(0, 10)
        ax.set_ylim(0, 10)
        ax.axis("off")
        box = FancyBboxPatch(
            (0.8, 3.2),
            8.4,
            3.6,
            boxstyle="round,pad=0.25,rounding_size=0.8",
            facecolor=fill,
            edgecolor="#000000",
            linewidth=1.2,
        )
        ax.add_patch(box)
        ax.text(5, 5, label, ha="center", va="center", fontsize=9, fontweight="bold")
        if arrow:
            arr = FancyArrowPatch((5, 2.8), (5, 0.6), arrowstyle="-|>", mutation_scale=12, color=ARROW, lw=1.4)
            ax.add_patch(arr)
        fig.savefig(path, dpi=160, bbox_inches="tight", transparent=True, pad_inches=0.02)
        plt.close(fig)
        return path

    def decision(self, label: str, *, arrow: bool = True) -> str:
        path = self._path()
        fig, ax = plt.subplots(figsize=(2.4, 1.05))
        ax.set_xlim(0, 10)
        ax.set_ylim(0, 10)
        ax.axis("off")
        diamond = Polygon(
            [(5, 9.2), (9.2, 5), (5, 0.8), (0.8, 5)],
            closed=True,
            facecolor=DECISION,
            edgecolor="#000000",
            linewidth=1.2,
        )
        ax.add_patch(diamond)
        ax.text(5, 5, label, ha="center", va="center", fontsize=8, fontweight="bold")
        ax.text(8.5, 6.2, "Ya", fontsize=7, color=ARROW)
        ax.text(1.2, 6.2, "Tidak", fontsize=7, color=ARROW)
        if arrow:
            arr = FancyArrowPatch((5, 0.6), (5, -0.2), arrowstyle="-|>", mutation_scale=12, color=ARROW, lw=1.4)
            ax.add_patch(arr)
        fig.savefig(path, dpi=160, bbox_inches="tight", transparent=True, pad_inches=0.02)
        plt.close(fig)
        return path

    def connector(self) -> str:
        path = self._path()
        fig, ax = plt.subplots(figsize=(0.5, 0.45))
        ax.set_xlim(0, 10)
        ax.set_ylim(0, 10)
        ax.axis("off")
        arr = FancyArrowPatch((5, 9), (5, 1), arrowstyle="-|>", mutation_scale=14, color=ARROW, lw=1.6)
        ax.add_patch(arr)
        fig.savefig(path, dpi=160, bbox_inches="tight", transparent=True, pad_inches=0.02)
        plt.close(fig)
        return path


# ---------------------------------------------------------------------------
# Excel helpers
# ---------------------------------------------------------------------------

def border_fmt(wb, **kw):
    base = {"font_name": "Arial", "font_size": 9, "valign": "vcenter", "text_wrap": True}
    base.update(kw)
    return wb.add_format(base)


def write_sop_sheet(wb, flow: FlowRenderer, name: str, title: str, steps: list[dict]):
    ws = wb.add_worksheet(name)
    ws.set_landscape()
    ws.set_paper(9)  # A4
    ws.fit_to_pages(1, 0)

    widths = [4, 38, 20, 7, 8, 8, 7, 12, 9, 20, 16]
    for i, w in enumerate(widths):
        ws.set_column(i, i, w)

    fmt_title = border_fmt(wb, bold=True, align="center", font_size=12, bg_color="#BDD7EE")
    fmt_hdr = border_fmt(wb, bold=True, align="center", bg_color="#D9E1F2")
    fmt_cell = border_fmt(wb)
    fmt_center = border_fmt(wb, align="center")
    fmt_mark = border_fmt(wb, align="center", bg_color="#F4B183", bold=True)
    fmt_flow_bg = border_fmt(wb, align="center", bg_color="#F9F9F9")

    ws.merge_range("A1:K1", "LAMPIRAN", fmt_title)
    ws.merge_range(
        "A2:K2",
        "Standar Operasional Prosedur (SOP) Penggunaan Aplikasi ARUMANIS "
        "dan Panel Pengawasan — Satu Data Air Minum dan Sanitasi Kabupaten Cianjur",
        border_fmt(wb, align="center", font_size=9),
    )
    ws.set_row(1, 32)
    ws.merge_range("A3:K3", "Nomor : ....................................          Tanggal : 1 Juli 2026", border_fmt(wb, align="center"))
    ws.merge_range(f"A4:K4", title, fmt_title)
    ws.set_row(3, 26)

    headers = ["No", "Kegiatan", "Flowchart", "Admin", "Operator", "Pengawas", "Sistem", "Kategori", "Waktu", "Output", "Ket"]
    for col, h in enumerate(headers):
        ws.write(4, col, h, fmt_hdr)
    ws.set_row(4, 28)

    row = 5
    for step in steps:
        roles = step.get("roles", {})
        marks = [
            MARK if roles.get("admin") else "",
            MARK if roles.get("operator") else "",
            MARK if roles.get("pengawas") else "",
            MARK if roles.get("sistem") else "",
        ]
        ws.write(row, 0, step["no"], fmt_center)
        ws.write(row, 1, step["kegiatan"], fmt_cell)
        ws.write(row, 2, "", fmt_flow_bg)

        img = step.get("flow_img")
        if img:
            ws.insert_image(
                row,
                2,
                img,
                {"x_offset": 8, "y_offset": 4, "x_scale": 0.85, "y_scale": 0.85},
            )

        for c, m in enumerate(marks, 3):
            ws.write(row, c, m, fmt_mark if m else fmt_center)
        ws.write(row, 7, step.get("kategori", ""), fmt_center)
        ws.write(row, 8, step.get("waktu", ""), fmt_center)
        ws.write(row, 9, step.get("output", ""), fmt_cell)
        ws.write(row, 10, step.get("ket", ""), fmt_cell)
        ws.set_row(row, step.get("height", 78))
        row += 1

    ws.merge_range(row, 0, row, 10, f"*** {title} — Arumanis v0.5.0 ***", border_fmt(wb, align="center", font_size=8))


def sheet_pengesahan(wb):
    ws = wb.add_worksheet("Halaman Pengesahan")
    ws.set_paper(9)
    ws.set_portrait()

    thin = border_fmt(wb)
    bold = border_fmt(wb, bold=True)
    bold_c = border_fmt(wb, bold=True, align="center")
    center = border_fmt(wb, align="center")
    title = border_fmt(wb, bold=True, align="center", font_size=12)
    label = border_fmt(wb, bold=True, align="right")
    val = border_fmt(wb, align="left")

    ws.set_column(0, 0, 2)
    ws.set_column(1, 5, 14)
    ws.set_column(6, 6, 2)
    ws.set_column(7, 11, 14)

    # Baris 1–4: kop pengesahan (mirip contoh)
    ws.merge_range("B1:F2", "DINAS PEKERJAAN UMUM DAN TATA RUANG\nKABUPATEN CIANJUR", bold_c)
    ws.set_row(0, 22)
    ws.set_row(1, 22)

    ws.merge_range("B3:F3", "BIDANG AIR MINUM DAN SANITASI", bold_c)
    ws.merge_range("B4:F4", "SEKSI PERENCANAAN DAN PENGEMBANGAN SISTEM INFORMASI", center)

    meta = [
        ("Nama SOP", "SOP Penggunaan Arumanis & Panel Pengawasan"),
        ("Tgl Pembuatan", "1 Juli 2026"),
        ("Tanggal Revisi", "—"),
        ("Tanggal Efektif", "1 Juli 2026"),
        ("Disahkan oleh", "Kepala Bidang Air Minum dan Sanitasi"),
    ]
    for i, (k, v) in enumerate(meta):
        r = i
        ws.write(r, 7, k, label)
        ws.merge_range(r, 8, r, 11, v, val)
        ws.set_row(r, 18)

    ws.merge_range("B6:F8", "SOP PENGGUNAAN APLIKASI ARUMANIS\nDAN PANEL PENGAWASAN", title)
    ws.set_row(5, 36)

    ws.merge_range("H6:K6", "Tanda Tangan dan Stempel", center)
    ws.merge_range("H7:K9", "", thin)
    ws.set_row(6, 18)
    ws.set_row(7, 48)
    ws.set_row(8, 18)

    # Tabel isi pengesahan 2 kolom
    start = 9
    ws.merge_range(start, 1, start, 5, "Dasar Hukum", bold)
    ws.merge_range(start, 7, start, 11, "Kualifikasi Pelaksana", bold)

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
        "3. Admin/Operator: mampu mengelola master data, kontrak, dan akses.\n"
        "4. Pengawas: mampu mengisi foto ber-GPS, progress, dan tiket lapangan."
    )
    ws.merge_range(start + 1, 1, start + 6, 5, dasar, thin)
    ws.merge_range(start + 1, 7, start + 6, 11, kualifikasi, thin)

    ws.merge_range(start + 7, 1, start + 7, 5, "Keterangan", bold)
    ws.merge_range(start + 7, 7, start + 7, 11, "Peralatan / Perlengkapan", bold)

    ket = (
        "1. SOP-01 Login & SSO\n"
        "2. SOP-02 Input Program (Arumanis Utama)\n"
        "3. SOP-03 Kontrak & Penyedia\n"
        "4. SOP-04 Pengawasan Lapangan\n"
        "5. SOP-05 Penugasan Pengawas\n"
        "6. SOP-06 Manajemen Akses\n"
        "7. Petunjuk Teknis Aplikasi Arumanis (docx)\n"
        "8. Panduan pengguna /docs dan /pengawasan/panduan"
    )
    alat = (
        "1. Perangkat komputer / laptop / tablet.\n"
        "2. Browser Chrome, Firefox, atau Edge versi terbaru.\n"
        "3. Koneksi internet stabil.\n"
        "4. Akun APIAMIS aktif (email & password).\n"
        "5. GPS perangkat (untuk upload foto lapangan).\n"
        "6. ATK (bila mencetak dokumentasi foto PDF)."
    )
    ws.merge_range(start + 8, 1, start + 14, 5, ket, thin)
    ws.merge_range(start + 8, 7, start + 14, 11, alat, thin)

    ws.merge_range(start + 15, 1, start + 15, 5, "Peringatan", bold)
    ws.merge_range(start + 15, 7, start + 15, 11, "Pencatatan dan Pendataan", bold)

    peringatan = (
        "1. Setiap pengguna wajib menjaga kerahasiaan akun dan password.\n"
        "2. Data yang diinput harus sesuai kondisi di lapangan; "
        "kesalahan menjadi tanggung jawab penginput.\n"
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
    ws.merge_range(start + 16, 1, start + 22, 5, peringatan, thin)
    ws.merge_range(start + 16, 7, start + 22, 11, pencatatan, thin)

    for i in range(start, start + 23):
        ws.set_row(i, 16 if i > start else 20)


def sheet_index(wb):
    ws = wb.add_worksheet("Daftar Isi")
    fmt_t = border_fmt(wb, bold=True, align="center", font_size=13, bg_color="#BDD7EE")
    fmt_h = border_fmt(wb, bold=True, align="center", bg_color="#D9E1F2")
    fmt_c = border_fmt(wb)
    ws.set_column(0, 0, 5)
    ws.set_column(1, 1, 24)
    ws.set_column(2, 2, 48)
    ws.set_column(3, 3, 14)
    ws.merge_range("A1:D1", "DAFTAR ISI — SOP ARUMANIS & PANEL PENGAWASAN", fmt_t)
    meta = [
        ("Versi", "1.0"),
        ("Platform", "Arumanis v0.5.0"),
        ("Tanggal", "1 Juli 2026"),
        ("Regenerasi", "bun run docs:sop:xlsx"),
    ]
    r = 2
    for k, v in meta:
        ws.write(r, 0, k, border_fmt(wb, bold=True))
        ws.merge_range(r, 1, r, 3, v, fmt_c)
        r += 1
    r += 1
    for c, h in enumerate(["No", "Lembar", "Judul", "Aplikasi"]):
        ws.write(r, c, h, fmt_h)
    r += 1
    rows = [
        ("—", "Halaman Pengesahan", "Pengesahan & metadata SOP", "—"),
        ("1", "SOP-01 Login & SSO", "Akses & Autentikasi", "Keduanya"),
        ("2", "SOP-02 Input Program", "Input Program Baru", "www/bun"),
        ("3", "SOP-03 Kontrak", "Kontrak & Penyedia", "www/bun"),
        ("4", "SOP-04 Pengawasan", "Pemantauan Lapangan", "www/pengawas"),
        ("5", "SOP-05 Penugasan", "Penugasan Pengawas", "Keduanya"),
        ("6", "SOP-06 Manajemen Akses", "Role & Permission", "www/bun"),
    ]
    for row in rows:
        for c, v in enumerate(row):
            ws.write(r, c, v, border_fmt(wb, align="center" if c != 2 else "left"))
        r += 1


def build_steps(flow: FlowRenderer) -> dict[str, list[dict]]:
    return {
        "SOP-01 Login & SSO": {
            "title": "FLOWCHART SOP AKSES & AUTENTIKASI ARUMANIS / PANEL PENGAWASAN",
            "steps": [
                {
                    "no": "1",
                    "kegiatan": "Pengguna membuka URL Arumanis di browser terbaru.",
                    "flow_img": flow.process("User"),
                    "roles": {"admin": True, "operator": True, "pengawas": True},
                    "kategori": "Akses",
                    "waktu": "± 2 menit",
                    "output": "Halaman /sign-in",
                },
                {
                    "no": "2",
                    "kegiatan": "Masukkan email & password APIAMIS → Sign In.",
                    "flow_img": flow.process("Login"),
                    "roles": {"admin": True, "operator": True, "pengawas": True},
                    "kategori": "Autentikasi",
                    "waktu": "± 1 menit",
                    "output": "Sesi cookie terbentuk",
                },
                {
                    "no": "3",
                    "kegiatan": "Sistem validasi kredensial via BFF → APIAMIS. Gagal: ulangi login.",
                    "flow_img": flow.decision("Berhasil?"),
                    "roles": {"sistem": True},
                    "kategori": "Validasi",
                    "waktu": "Real-time",
                    "output": "Token valid / error",
                    "height": 88,
                },
                {
                    "no": "4",
                    "kegiatan": "Cek role: Admin/Operator/Viewer → Dashboard; Pengawas → SSO panel.",
                    "flow_img": flow.process("Cek Role"),
                    "roles": {"sistem": True},
                    "kategori": "Routing",
                    "waktu": "Real-time",
                    "output": "Halaman tujuan",
                },
                {
                    "no": "5",
                    "kegiatan": "SSO pengawas: /pengawasan/login?token → cookie pengawas_session.",
                    "flow_img": flow.process("SSO", fill=PROCESS),
                    "roles": {"pengawas": True, "sistem": True},
                    "kategori": "SSO",
                    "waktu": "± 30 dtk",
                    "output": "Dashboard /pengawasan/",
                    "ket": "Tanpa login terpisah",
                },
                {
                    "no": "6",
                    "kegiatan": "Operasional sesuai SOP modul. Logout via avatar → Logout.",
                    "flow_img": flow.process("Selesai", arrow=False),
                    "roles": {"admin": True, "operator": True, "pengawas": True},
                    "kategori": "Operasional",
                    "waktu": "Sesuai tugas",
                    "output": "Sesi berakhir",
                },
            ],
        },
        "SOP-02 Input Program": {
            "title": "FLOWCHART SOP INPUT PROGRAM BARU (ARUMANIS UTAMA)",
            "steps": [
                {
                    "no": "1",
                    "kegiatan": "Login → buka /kegiatan.",
                    "flow_img": flow.process("Kegiatan"),
                    "roles": {"admin": True, "operator": True},
                    "kategori": "Perencanaan",
                    "waktu": "± 15 mnt",
                    "output": "Master kegiatan",
                },
                {
                    "no": "2",
                    "kegiatan": "Tambah kegiatan: nama, kode, dana, pagu, TA.",
                    "flow_img": flow.process("Tambah"),
                    "roles": {"operator": True},
                    "kategori": "Input",
                    "waktu": "± 10 mnt",
                    "output": "Kegiatan tersimpan",
                },
                {
                    "no": "3",
                    "kegiatan": "Tambah pekerjaan: kegiatan, kecamatan, desa, pagu.",
                    "flow_img": flow.process("Pekerjaan"),
                    "roles": {"operator": True},
                    "kategori": "Input",
                    "waktu": "± 15 mnt",
                    "output": "Pekerjaan aktif",
                },
                {
                    "no": "4",
                    "kegiatan": "Tambah output & penerima per pekerjaan.",
                    "flow_img": flow.process("Output"),
                    "roles": {"operator": True},
                    "kategori": "Input",
                    "waktu": "± 20 mnt",
                    "output": "Komponen tercatat",
                },
                {
                    "no": "5",
                    "kegiatan": "Upload berkas & foto awal (opsional).",
                    "flow_img": flow.process("Berkas"),
                    "roles": {"operator": True},
                    "kategori": "Dokumentasi",
                    "waktu": "± 15 mnt",
                    "output": "File terunggah",
                },
                {
                    "no": "6",
                    "kegiatan": "Verifikasi dashboard & data quality. Tidak lengkap → perbaiki.",
                    "flow_img": flow.decision("Lengkap?"),
                    "roles": {"admin": True, "operator": True},
                    "kategori": "Verifikasi",
                    "waktu": "± 5 mnt",
                    "output": "Data siap",
                    "height": 88,
                },
            ],
        },
        "SOP-03 Kontrak": {
            "title": "FLOWCHART SOP KONTRAK & PENYEDIA",
            "steps": [
                {
                    "no": "1",
                    "kegiatan": "Pastikan pekerjaan & penyedia terdaftar.",
                    "flow_img": flow.process("Prasyarat"),
                    "roles": {"operator": True},
                    "kategori": "Persiapan",
                    "waktu": "± 10 mnt",
                    "output": "Data induk siap",
                },
                {
                    "no": "2",
                    "kegiatan": "Buat kontrak: pekerjaan, penyedia, nilai, tanggal.",
                    "flow_img": flow.process("Kontrak"),
                    "roles": {"operator": True},
                    "kategori": "Kontrak",
                    "waktu": "± 20 mnt",
                    "output": "Kontrak aktif",
                },
                {
                    "no": "3",
                    "kegiatan": "Addendum & register dokumen bila diperlukan.",
                    "flow_img": flow.decision("Addendum?"),
                    "roles": {"operator": True},
                    "kategori": "Addendum",
                    "waktu": "Sesuai kebutuhan",
                    "output": "Dokumen sinkron",
                    "height": 88,
                },
                {
                    "no": "4",
                    "kegiatan": "Verifikasi status kontrak di dashboard.",
                    "flow_img": flow.process("Selesai", arrow=False),
                    "roles": {"admin": True, "operator": True},
                    "kategori": "Monitoring",
                    "waktu": "± 5 mnt",
                    "output": "Siap ditugaskan",
                },
            ],
        },
        "SOP-04 Pengawasan": {
            "title": "FLOWCHART SOP PEMANTAUAN LAPANGAN (PANEL PENGAWASAN)",
            "steps": [
                {
                    "no": "1",
                    "kegiatan": "Login SSO → Dashboard /pengawasan/.",
                    "flow_img": flow.process("SSO"),
                    "roles": {"pengawas": True, "sistem": True},
                    "kategori": "Akses",
                    "waktu": "± 2 mnt",
                    "output": "KPI tampil",
                },
                {
                    "no": "2",
                    "kegiatan": "Baca KPI & buka paket perlu perhatian.",
                    "flow_img": flow.process("Dashboard"),
                    "roles": {"pengawas": True},
                    "kategori": "Pemantauan",
                    "waktu": "Harian",
                    "output": "Prioritas paket",
                },
                {
                    "no": "3",
                    "kegiatan": "Tab Penerima: kelola penerima individu/komunal.",
                    "flow_img": flow.process("Penerima"),
                    "roles": {"pengawas": True},
                    "kategori": "Data",
                    "waktu": "Per paket",
                    "output": "Penerima lengkap",
                },
                {
                    "no": "4",
                    "kegiatan": "Tab Foto: upload slot 0–100% + GPS per output.",
                    "flow_img": flow.process("Foto", fill=PROCESS),
                    "roles": {"pengawas": True},
                    "kategori": "Dokumentasi",
                    "waktu": "Per kunjungan",
                    "output": "Matriks foto terisi",
                },
                {
                    "no": "5",
                    "kegiatan": "Tab Progress / Buat Laporan: rencana & realisasi mingguan.",
                    "flow_img": flow.process("Progress"),
                    "roles": {"pengawas": True},
                    "kategori": "Pelaporan",
                    "waktu": "Mingguan",
                    "output": "Deviasi terupdate",
                },
                {
                    "no": "6",
                    "kegiatan": "Ada kendala? Buat tiket. Tidak → selesai.",
                    "flow_img": flow.decision("Kendala?"),
                    "roles": {"pengawas": True},
                    "kategori": "Tiket",
                    "waktu": "Sesuai kejadian",
                    "output": "Tiket / selesai",
                    "height": 88,
                },
                {
                    "no": "7",
                    "kegiatan": "Data tersinkron ke Arumanis via APIAMIS.",
                    "flow_img": flow.process("Sinkron", arrow=False),
                    "roles": {"admin": True, "sistem": True},
                    "kategori": "Integrasi",
                    "waktu": "Real-time",
                    "output": "Data kantor = lapangan",
                },
            ],
        },
        "SOP-05 Penugasan": {
            "title": "FLOWCHART SOP PENUGASAN PENGAWAS",
            "steps": [
                {
                    "no": "1",
                    "kegiatan": "Admin: master /pengawas (NIP benar).",
                    "flow_img": flow.process("Pengawas"),
                    "roles": {"admin": True},
                    "kategori": "Master",
                    "waktu": "± 10 mnt",
                    "output": "Data valid",
                },
                {
                    "no": "2",
                    "kegiatan": "User punya role pengawas di /users.",
                    "flow_img": flow.process("User"),
                    "roles": {"admin": True},
                    "kategori": "Akses",
                    "waktu": "± 5 mnt",
                    "output": "Role aktif",
                },
                {
                    "no": "3",
                    "kegiatan": "Assign pekerjaan di /user-pekerjaan.",
                    "flow_img": flow.process("Assign"),
                    "roles": {"admin": True},
                    "kategori": "Penugasan",
                    "waktu": "± 15 mnt",
                    "output": "Paket di dashboard",
                    "ket": "Wajib",
                },
                {
                    "no": "4",
                    "kegiatan": "Pengawas login: paket tampil? Tidak → ulangi assign.",
                    "flow_img": flow.decision("Tampil?"),
                    "roles": {"pengawas": True, "admin": True},
                    "kategori": "Verifikasi",
                    "waktu": "± 5 mnt",
                    "output": "Penugasan efektif",
                    "height": 88,
                },
            ],
        },
        "SOP-06 Manajemen Akses": {
            "title": "FLOWCHART SOP MANAJEMEN AKSES (ADMIN)",
            "steps": [
                {
                    "no": "1",
                    "kegiatan": "Kelola Roles & Permissions.",
                    "flow_img": flow.process("Role"),
                    "roles": {"admin": True},
                    "kategori": "RBAC",
                    "waktu": "± 15 mnt",
                    "output": "Role siap",
                },
                {
                    "no": "2",
                    "kegiatan": "Atur Route & Menu Permissions.",
                    "flow_img": flow.process("Route"),
                    "roles": {"admin": True},
                    "kategori": "RBAC",
                    "waktu": "± 20 mnt",
                    "output": "Akses terkontrol",
                },
                {
                    "no": "3",
                    "kegiatan": "Tambah user & uji login.",
                    "flow_img": flow.decision("Sesuai?"),
                    "roles": {"admin": True},
                    "kategori": "Uji coba",
                    "waktu": "± 10 mnt",
                    "output": "Hak akses benar",
                    "height": 88,
                },
            ],
        },
    }


def main():
    tmp = Path(tempfile.mkdtemp(prefix="sop_flow_"))
    flow = FlowRenderer(tmp)
    try:
        OUT.parent.mkdir(parents=True, exist_ok=True)
        try:
            out_path = OUT
            wb = xlsxwriter.Workbook(str(out_path))
        except xlsxwriter.exceptions.FileCreateError:
            out_path = OUT.with_stem(OUT.stem + "_baru")
            wb = xlsxwriter.Workbook(str(out_path))

        sheet_index(wb)
        sheet_pengesahan(wb)

        for sheet_name, cfg in build_steps(flow).items():
            write_sop_sheet(wb, flow, sheet_name, cfg["title"], cfg["steps"])

        wb.close()
        print(f"✓ SOP Excel tersimpan: {out_path}")
        print(f"  Flowchart: {flow.counter} shape PNG (bukan teks garis)")
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == "__main__":
    main()