#!/usr/bin/env python3
"""Isi Template Proposal LIDA-2026 REV tanpa mengubah format dokumen."""

from __future__ import annotations

import json
import re
import shutil
import subprocess
import sys
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TEMPLATE = Path(r"C:\Users\asusg\Downloads\Template Proposal LIDA-2026 REV (1).docx")
DATA_PATH = ROOT / "docs" / "proposal-live-data.json"
OUT_DOCX = ROOT / "docs" / "Proposal_Inovasi_Arumanis_LIDA_2026.docx"
WORK_DIR = ROOT / "docs" / "_lida_template_work"
UNPACK = Path(r"C:\Users\asusg\.grok\skills\docx\scripts\office\unpack.py")
PACK = Path(r"C:\Users\asusg\.grok\skills\docx\scripts\office\pack.py")

FOREIGN_TERMS = [
    "single source of truth",
    "role-based access",
    "Sustainability Plan",
    "server-side",
    "audit log",
    "real-time",
    "dashboard",
    "monitoring",
    "progress",
    "platform",
    "prototype",
    "broadcast",
    "baseline",
    "snapshot",
    "coverage",
    "pipeline",
    "backend",
    "frontend",
    "WhatsApp",
    "PostgreSQL",
    "Excel",
    "Laravel",
    "React",
    "upload",
    "online",
    "login",
    "output",
    "input",
    "record",
    "digital",
    "beta",
    "API",
    "SSO",
    "SPA",
    "GPS",
    "CSV",
    "PDF",
    "KPI",
    "gap",
    "deviasi",
    "slot",
    "SDGs",
    "SPAM",
    "SPBE",
    "RPJMN",
    "RPJMD",
    "SIMSPAM",
    "PAMSIMAS",
    "RISPAM",
    "outcomes",
    "Output",
    "update",
    "upgrade",
]
FOREIGN_PATTERN = re.compile(
    r"\b("
    + "|".join(re.escape(t) for t in sorted(FOREIGN_TERMS, key=len, reverse=True))
    + r")\b",
    re.IGNORECASE,
)


def fmt_num(n: float | int) -> str:
    return f"{int(round(float(n))):,}".replace(",", ".")


def fmt_pct(n: float | int) -> str:
    return f"{float(n):.2f}".replace(".", ",") + "%"


def fmt_milyar(n: float | int) -> str:
    v = float(n) / 1_000_000_000
    return f"Rp {v:.2f}".replace(".", ",") + " miliar"


def runs_xml(text: str, *, bold: bool = False, size: int | None = None) -> str:
    parts: list[str] = []
    last = 0
    for m in FOREIGN_PATTERN.finditer(text):
        if m.start() > last:
            parts.append(plain_run(text[last : m.start()], bold=bold, size=size))
        parts.append(italic_run(m.group(0), bold=bold, size=size))
        last = m.end()
    if last < len(text):
        parts.append(plain_run(text[last:], bold=bold, size=size))
    if not parts:
        parts.append(plain_run(text, bold=bold, size=size))
    return "".join(parts)


def rpr(bold: bool = False, italic: bool = False, size: int | None = None) -> str:
    bits = [
        '<w:rFonts w:eastAsia="Times New Roman" w:cs="Times New Roman"/>',
        '<w:color w:val="1A1A1A"/>',
    ]
    if bold:
        bits.extend(["<w:b/>", "<w:bCs/>"])
    if italic:
        bits.extend(["<w:i/>", "<w:iCs/>"])
    if size:
        bits.append(f'<w:sz w:val="{size}"/>')
        bits.append(f'<w:szCs w:val="{size}"/>')
    return "<w:rPr>" + "".join(bits) + "</w:rPr>"


def plain_run(text: str, bold: bool = False, size: int | None = None) -> str:
    esc = (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )
    preserve = ' xml:space="preserve"' if text.startswith(" ") or text.endswith(" ") else ""
    return f"<w:r>{rpr(bold=bold, size=size)}<w:t{preserve}>{esc}</w:t></w:r>"


def italic_run(text: str, bold: bool = False, size: int | None = None) -> str:
    esc = (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )
    preserve = ' xml:space="preserve"' if text.startswith(" ") or text.endswith(" ") else ""
    return (
        f"<w:r>{rpr(bold=bold, italic=True, size=size)}"
        f"<w:t{preserve}>{esc}</w:t></w:r>"
    )


RSID = "00B573CA"


def body_para(text: str, para_id: str = "24427AFB", indent: int | None = None) -> str:
    ppr = ['<w:spacing w:before="40" w:after="160" w:line="360" w:lineRule="auto"/>']
    if indent:
        ppr.append(f'<w:ind w:left="{indent}"/>')
    ppr.append('<w:jc w:val="both"/>')
    return (
        f'<w:p w14:paraId="{para_id}" w14:textId="77777777" w:rsidR="{RSID}" '
        f'w:rsidRDefault="{RSID}" w:rsidP="{RSID}">'
        f"<w:pPr>{''.join(ppr)}</w:pPr>"
        f"{runs_xml(text)}"
        "</w:p>"
    )


def checkbox_para(label: str, checked: bool) -> str:
    mark = "x" if checked else " "
    return f"( {mark} ) {label}"


def load_data() -> dict:
    raw = DATA_PATH.read_text(encoding="utf-8").replace("\ufeff", "")
    return json.loads(raw)


def build_content(data: dict) -> dict[str, str | list[str]]:
    spam = data["spam"]
    san = data["sanitasi"]
    dash = data["dashboard"]
    pengawas = data["pengawas"]
    scope = data.get("dataScope", {})
    fetched = datetime.fromisoformat(data["fetchedAt"].replace("Z", "+00:00")).strftime(
        "%d %B %Y"
    )
    fetched = (
        fetched.replace("January", "Januari")
        .replace("February", "Februari")
        .replace("March", "Maret")
        .replace("April", "April")
        .replace("May", "Mei")
        .replace("June", "Juni")
        .replace("July", "Juli")
        .replace("August", "Agustus")
        .replace("September", "September")
        .replace("October", "Oktober")
        .replace("November", "November")
        .replace("December", "Desember")
    )
    today = "6 Juli 2026"
    spm = "Standar Pelayanan Minimum (SPM)"
    sync_start = scope.get("syncStartYear", 2017)
    earliest = scope.get("earliestAchievementYear", "2009")
    gap_air = max(0, int(spam["total_target"]) - int(spam["capaian_kk"]))
    gap_san = max(0, int(san["target_kk"]) - int(san["total_pemanfaat_kk"]))

    return {
        "nama_inovasi": "Arumanis – Air Minum dan Sanitasi",
        "tahapan": [
            checkbox_para("Inisiatif", False),
            checkbox_para("Uji Coba", False),
            checkbox_para("Diterapkan", True),
        ],
        "inisiator_jenis": [
            checkbox_para("Kepala Daerah", False),
            checkbox_para("Anggota DPRD", False),
            checkbox_para("ASN", False),
            checkbox_para("OPD", True),
        ],
        "nama_inisiator": "Ilham Taufiq (pengembang) / Bidang Air Minum dan Sanitasi, Dinas Perumahan dan Kawasan Permukiman Kabupaten Cianjur",
        "jenis": [checkbox_para("Digital", True), checkbox_para("Non-Digital", False)],
        "bentuk": [
            checkbox_para("Inovasi Tata kelola Pemerintahan", True),
            checkbox_para("Inovasi Pelayanan Publik", True),
            checkbox_para("Diterapkan", False),
        ],
        "koordinat": "-6,824783; 107,139081 (Kantor Dinas Perumahan dan Kawasan Permukiman Kabupaten Cianjur)",
        "opd": "Dinas Perumahan dan Kawasan Permukiman Kabupaten Cianjur",
        "urusan": "Perumahan dan Kawasan Permukiman (penyediaan air minum perdesaan dan sanitasi lingkungan)",
        "uji_coba": "Januari 2024",
        "diterapkan": "Januari 2025",
        "pengembangan": "Juli 2023",
        "dasar_hukum": (
            "Inovasi Arumanis berlandaskan Undang-Undang Nomor 17 Tahun 2019 tentang Sumber Daya Air; "
            "Undang-Undang Nomor 23 Tahun 2014 tentang Pemerintahan Daerah; Undang-Undang Nomor 11 Tahun 2008 "
            "tentang Informasi dan Transaksi Elektronik; Undang-Undang Nomor 14 Tahun 2008 tentang Keterbukaan "
            "Informasi Publik; serta Undang-Undang Nomor 18 Tahun 2008 tentang Pengelolaan Sampah. "
            "Bidang air minum: Peraturan Pemerintah Nomor 16 Tahun 2005 tentang Pengembangan Sistem Penyediaan "
            "Air Minum (SPAM); Permen PUPR Nomor 18/PRT/M/2007; Permen PU Nomor 20 Tahun 2006. Bidang sanitasi: "
            "Permen PUPR Nomor 14/PRT/M/2014 (PAMSIMAS); Permenkes Nomor 2 Tahun 2023 tentang SPM Bidang Kesehatan; "
            "Permen PUPR Nomor 27/PRT/M/2018. Tata kelola digital: Permendagri Nomor 59 Tahun 2016 tentang "
            "Penerapan SPBE; Permendagri Nomor 108 Tahun 2016. Tingkat daerah: Perda Kabupaten Cianjur "
            "Nomor 14 Tahun 2021; Perbup Nomor 102 Tahun 2021 (tugas-fungsi DPKP); Perbup Nomor 23 Tahun 2020 "
            "(RAD PAMSIMAS); RPJMD 2025–2029; Kajian RISPAM Kabupaten Cianjur."
        ),
        "permasalahan": (
            f"Permasalahan makro: Kabupaten Cianjur dengan {fmt_num(san['total_penduduk'])} jiwa penduduk "
            f"di 33 kecamatan dan 365 desa masih menghadapi kesenjangan akses air minum layak dan sanitasi. "
            f"Per {fetched}, capaian {spm} air minum {fmt_pct(spam['coverage_percentage'])} "
            f"({fmt_num(gap_air)} KK belum terlayani) dan sanitasi {fmt_pct(san['coverage_kk_percentage'])} "
            f"({fmt_num(san['desa_without_infrastruktur'])} desa belum berinfrastruktur terpetakan). "
            f"Permasalahan mikro: pemantauan progres fisik, keuangan, dan dokumentasi lapangan dilakukan manual "
            f"melalui Excel, PDF, WhatsApp, dan berkas fisik tanpa jejak terpusat. Rekapitulasi capaian SPM "
            f"lintas 365 desa memakan 5–10 hari kerja. Data historis sejak {sync_start} tersebar di berbagai "
            f"format dan belum sepenuhnya terharmonisasi."
        ),
        "isu_strategis": (
            "Arumanis mendukung SDGs 6 (air bersih dan sanitasi layak), Asta Cita terkait penurunan stunting, "
            "serta reformasi birokrasi melalui digitalisasi SPBE. Di tingkat nasional, inovasi selaras RPJMN "
            "dan program PAMSIMAS. Di tingkat daerah, inovasi mendukung RPJMD 2025–2029, RISPAM Kabupaten "
            "Cianjur, RAD PAMSIMAS, serta prioritas peningkatan cakupan layanan air minum dan sanitasi di "
            "365 desa/kelurahan."
        ),
        "metode": (
            f"Metode pembaharuan dilakukan dengan membandingkan kondisi sebelum dan sesudah penerapan Arumanis. "
            f"Sebelum inovasi: data progres tersebar dalam 4–6 format (Excel, PDF, WhatsApp, berkas fisik); "
            f"rekapitulasi {spm} 5–10 hari kerja; laporan pengawas 2–4 minggu; dokumentasi foto tidak terarsip "
            f"terpusat. Sesudah inovasi (per {fetched}): {fmt_num(dash['totalPekerjaan'])} paket pekerjaan "
            f"terpantau; rekapitulasi {spm} kurang dari 1 hari kerja; {fmt_num(pengawas['total_pengawas'])} "
            f"pengawas aktif di {fmt_num(pengawas['total_lokasi'])} lokasi dengan laporan mingguan terstruktur; "
            f"{fmt_num(spam['total_foto_dokumentasi'])} foto dokumentasi terarsip; {fmt_num(spam['total_units'])} "
            f"unit SPAM terdata digital; peta capaian 365 desa dapat diakses masyarakat tanpa pendaftaran."
        ),
        "keunggulan": (
            "Keunggulan utama Arumanis dibanding sistem sejenis terletak pada pemantauan pekerjaan konstruksi "
            "SPAM perdesaan dan sanitasi (khususnya pengelolaan air limbah) dalam satu aplikasi terintegrasi, "
            "bukan hanya pencatatan aset statis. Kebaharuan meliputi penyajian capaian SPM terbuka per desa, "
            f"penandaan tingkat kelengkapan data, keterkaitan data unit SPAM nasional SIMSPAM "
            f"({fmt_num(spam['simspam_count'])} unit), dokumentasi foto berlokasi, hak akses berbeda per peran "
            f"pengguna, serta penggabungan data historis multi-sumber sejak {sync_start}."
        ),
        "tahapan_inovasi": (
            "(1) Operator/koordinator dinas membuka aplikasi Arumanis untuk mengelola kegiatan, kontrak, "
            "dan data SPAM/sanitasi. (2) Pengawas lapangan mengisi progres mingguan, mengunggah foto lokasi, "
            "dan laporan anggaran fisik melalui fitur pengawasan terpadu. (3) Masyarakat membuka halaman peta "
            "capaian SPM per desa tanpa pendaftaran. (4) Data langsung tersimpan dan tampilan ringkasan "
            "diperbarui untuk evaluasi program."
        ),
        "tujuan": (
            "Tujuan inovasi diarahkan pada terwujudnya pemantauan pekerjaan konstruksi SPAM perdesaan dan "
            "sanitasi yang terukur, disertai kemampuan menyajikan data terkini. Target hingga akhir 2026: "
            f"(1) seluruh paket aktif terpantau ({fmt_num(dash['totalPekerjaan'])} pekerjaan tercatat); "
            "(2) progres fisik dilaporkan minimal mingguan; (3) dokumentasi foto ≥90% paket aktif; "
            f"(4) penyelarasan data historis {sync_start}–sekarang dengan selisih antarsumber di bawah 5%; "
            "(5) ringkasan capaian 365 desa diperbarui langsung; (6) publikasi capaian SPM dapat diakses "
            "masyarakat tanpa pendaftaran."
        ),
        "manfaat": (
            f"Bagi penyelenggara program: deviasi fisik dan keuangan teridentifikasi lebih awal; evaluasi {spm} "
            f"air minum ({fmt_pct(spam['coverage_percentage'])}) dan sanitasi ({fmt_pct(san['coverage_kk_percentage'])}); "
            f"anggaran terpetakan air minum {fmt_milyar(spam['capaian_nilai_kontrak'])}, sanitasi "
            f"{fmt_milyar(san['total_investasi'])}, pekerjaan {fmt_milyar(dash['totalPaguPekerjaan'])} "
            f"({fmt_num(dash['totalKontrak'])} kontrak). Bagi pengawas: alur kerja terstruktur dalam satu "
            "aplikasi. Bagi masyarakat: capaian per desa dapat dicek kapan saja tanpa ke kantor dinas. "
            f"Manfaat menjangkau {fmt_num(san['total_penduduk'])} jiwa penduduk di 33 kecamatan."
        ),
        "hasil": (
            f"Hasil penyelenggaraan inovasi Arumanis per {fetched} berupa aplikasi digital yang mendukung "
            "pemantauan konstruksi dan penyajian data program secara langsung. Output inovasi meliputi: "
            f"(1) aplikasi Arumanis dengan tampilan ringkasan pekerjaan, pencatatan kegiatan dan kontrak, "
            "data unit SPAM dan sanitasi, penandaan kelengkapan data, serta fitur pengawasan lapangan; "
            f"(2) halaman informasi terbuka berisi peta capaian {spm} per desa; (3) data terintegrasi memuat "
            f"{fmt_num(dash['totalPekerjaan'])} pekerjaan, {fmt_num(spam['total_units'])} unit SPAM, "
            f"{fmt_num(san['total_count'])} infrastruktur sanitasi, {fmt_num(spam['total_foto_dokumentasi'])} "
            f"foto dokumentasi, dan {fmt_num(scope.get('totalAchievementRecords', spam['achievement_records']))} "
            f"catatan capaian ({earliest}–{scope.get('latestAchievementYear', '2026')})."
        ),
        "tanggal": today,
        "inisiator_ttd": "ILHAM TAUFIQ",
    }


def replace_tc_value_block(
    xml: str, para_ids: list[str], lines: list[str]
) -> str:
    """Ganti paragraf dalam sel nilai tabel, mempertahankan paraId asli."""
    if len(para_ids) != len(lines):
        raise ValueError("para_ids dan lines harus sama panjangnya")
    first_para_id = para_ids[0]
    last_para_id = para_ids[-1]
    start_marker = f'w14:paraId="{first_para_id}"'
    end_marker = f'w14:paraId="{last_para_id}"'
    start_idx = xml.find(start_marker)
    end_idx = xml.find(end_marker)
    if start_idx == -1 or end_idx == -1:
        raise ValueError(f"paraId sel tidak ditemukan: {first_para_id} / {last_para_id}")
    p_start = xml.rfind("<w:p", 0, start_idx)
    p_end = xml.find("</w:p>", end_idx) + len("</w:p>")
    new_paras = []
    for para_id, line in zip(para_ids, lines):
        new_paras.append(
            f'<w:p w14:paraId="{para_id}" w14:textId="77777777" w:rsidR="{RSID}" '
            f'w:rsidRDefault="{RSID}" w:rsidP="001A2A46">'
            '<w:pPr><w:spacing w:before="40" w:after="40" w:line="360" w:lineRule="auto"/>'
            '<w:rPr><w:rFonts w:eastAsia="Times New Roman" w:cs="Times New Roman"/>'
            '<w:color w:val="1A1A1A"/></w:rPr></w:pPr>'
            f"{runs_xml(line)}"
            "</w:p>"
        )
    return xml[:p_start] + "".join(new_paras) + xml[p_end:]


def replace_para_text(xml: str, old: str, new_text: str) -> str:
    idx = xml.find(old)
    if idx == -1:
        raise ValueError(f"Teks tidak ditemukan: {old[:80]}...")
    p_start = xml.rfind("<w:p", 0, idx)
    p_end = xml.find("</w:p>", idx) + len("</w:p>")
    new_para = body_para(new_text, para_id="FILL0002")
    return xml[:p_start] + new_para + xml[p_end:]


def replace_para_by_id(xml: str, para_id: str, new_text: str, indent: int | None = None) -> str:
    marker = f'w14:paraId="{para_id}"'
    idx = xml.find(marker)
    if idx == -1:
        raise ValueError(f"paraId tidak ditemukan: {para_id}")
    p_start = xml.rfind("<w:p", 0, idx)
    p_end = xml.find("</w:p>", idx) + len("</w:p>")
    new_para = body_para(new_text, para_id=para_id, indent=indent)
    return xml[:p_start] + new_para + xml[p_end:]


def replace_simple(xml: str, old: str, new: str) -> str:
    if old not in xml:
        raise ValueError(f"Teks tidak ditemukan: {old}")
    return xml.replace(old, new, 1)


def fill_document(xml: str, c: dict[str, str | list[str]]) -> str:
    # Nama Inovasi (sel kosong)
    xml = xml.replace(
        '<w:p w14:paraId="245BBE8C" w14:textId="2ABC0A82" w:rsidR="00B5470B" w:rsidRPr="00B5470B" w:rsidRDefault="00B5470B" w:rsidP="001A2A46">\n'
        "            <w:pPr>\n"
        '              <w:spacing w:before="40" w:after="40" w:line="360" w:lineRule="auto"/>\n'
        "            </w:pPr>\n"
        "          </w:p>",
        f'<w:p w14:paraId="245BBE8C" w14:textId="2ABC0A82" w:rsidR="00B5470B" w:rsidRPr="00B5470B" w:rsidRDefault="{RSID}" w:rsidP="001A2A46">\n'
        "            <w:pPr>\n"
        '              <w:spacing w:before="40" w:after="40" w:line="360" w:lineRule="auto"/>\n'
        "            </w:pPr>\n"
        f"            {runs_xml(str(c['nama_inovasi']))}\n"
        "          </w:p>",
        1,
    )

    xml = replace_tc_value_block(
        xml,
        ["2EEDA8F3", "12E28356", "210C9202"],
        list(c["tahapan"]),  # type: ignore[arg-type]
    )
    xml = replace_tc_value_block(
        xml,
        ["13DB11B2", "450830C5", "32634CF8", "2B892CB7"],
        list(c["inisiator_jenis"]),  # type: ignore[arg-type]
    )

    # Nama Inisiator
    xml = xml.replace(
        '<w:p w14:paraId="797480A1" w14:textId="77777777" w:rsidR="00B5470B" w:rsidRPr="00B5470B" w:rsidRDefault="00B5470B" w:rsidP="001A2A46">\n'
        "            <w:pPr>\n"
        '              <w:spacing w:before="40" w:after="40" w:line="360" w:lineRule="auto"/>\n'
        "            </w:pPr>\n"
        "          </w:p>",
        f'<w:p w14:paraId="797480A1" w14:textId="77777777" w:rsidR="00B5470B" w:rsidRPr="00B5470B" w:rsidRDefault="{RSID}" w:rsidP="001A2A46">\n'
        "            <w:pPr>\n"
        '              <w:spacing w:before="40" w:after="40" w:line="360" w:lineRule="auto"/>\n'
        "            </w:pPr>\n"
        f"            {runs_xml(str(c['nama_inisiator']))}\n"
        "          </w:p>",
        1,
    )

    xml = replace_tc_value_block(
        xml, ["547A8C59", "6566FC9D"], list(c["jenis"])  # type: ignore[arg-type]
    )
    xml = replace_tc_value_block(
        xml,
        ["1B3900DF", "74E31FC2", "00166CBA"],
        list(c["bentuk"]),  # type: ignore[arg-type]
    )

    xml = replace_simple(xml, "(Titik Lokasi Inovasi)", str(c["koordinat"]))
    xml = replace_simple(xml, "[Nama Perangkat Daerah sesuai nomenklatur]", str(c["opd"]))
    xml = replace_simple(
        xml,
        "(diisi dengan urusan pemerintahan yang menjadi tupoksi OPD. Contoh Kesehatan, pendidikan dsb)",
        str(c["urusan"]),
    )

    for old in [
        "Diisi tanggal bulan dan tahun (bukan rentang waktu)",
    ]:
        pass
    # tanggal — tiga sel berbeda, ganti berurutan
    xml = replace_simple(xml, "Diisi tanggal bulan dan tahun (bukan rentang waktu)", str(c["uji_coba"]))
    xml = replace_simple(xml, "Diisi tanggal bulan dan tahun (bukan rentang waktu)", str(c["diterapkan"]))
    xml = replace_simple(xml, "Diisi tanggal bulan dan tahun (bukan rentang waktu)", str(c["pengembangan"]))

    # Bagian II placeholders (ganti via paraId agar struktur XML tetap valid)
    xml = replace_para_by_id(xml, "24427AFB", str(c["dasar_hukum"]))
    xml = replace_para_by_id(xml, "7F563E2C", str(c["permasalahan"]))
    xml = replace_para_by_id(xml, "6CC3448A", str(c["isu_strategis"]))
    xml = replace_para_by_id(xml, "38DBA493", str(c["metode"]))
    xml = replace_para_by_id(xml, "08D15C06", str(c["keunggulan"]))
    xml = replace_para_by_id(xml, "74B7F3CC", str(c["tahapan_inovasi"]))
    xml = replace_para_by_id(xml, "7C2D230A", str(c["tujuan"]), indent=360)

    # Manfaat — ganti seluruh paragraf kompleks
    manfaat_start = xml.find('<w:p w14:paraId="53A697C0"')
    manfaat_end = xml.find("</w:p>", manfaat_start) + len("</w:p>")
    xml = xml[:manfaat_start] + body_para(str(c["manfaat"]), para_id="53A697C0", indent=360) + xml[manfaat_end:]

    # Hasil — ganti paragraf instruksi
    hasil_start = xml.find('<w:p w14:paraId="1F41F2C8"')
    hasil_end = xml.find("</w:p>", hasil_start) + len("</w:p>")
    xml = xml[:hasil_start] + body_para(str(c["hasil"]), para_id="1F41F2C8", indent=360) + xml[hasil_end:]

    xml = replace_simple(xml, "Cianjur, ........................................", f"Cianjur, {c['tanggal']}")
    # Inisiator signature (kolom kanan)
    parts = xml.rsplit("(Nama Jelas)", 1)
    if len(parts) == 2:
        xml = parts[0] + str(c["inisiator_ttd"]) + parts[1]

    return xml


def main() -> int:
    if not TEMPLATE.exists():
        print(f"Template tidak ditemukan: {TEMPLATE}", file=sys.stderr)
        return 1

    data = load_data()
    content = build_content(data)

    if WORK_DIR.exists():
        shutil.rmtree(WORK_DIR)
    WORK_DIR.mkdir(parents=True)

    subprocess.run([sys.executable, str(UNPACK), str(TEMPLATE), str(WORK_DIR)], check=True)

    doc_path = WORK_DIR / "word" / "document.xml"
    xml = doc_path.read_text(encoding="utf-8")
    xml = fill_document(xml, content)
    doc_path.write_text(xml, encoding="utf-8")

    if OUT_DOCX.exists():
        OUT_DOCX.unlink()
    subprocess.run(
        [sys.executable, str(PACK), str(WORK_DIR), str(OUT_DOCX), "--original", str(TEMPLATE)],
        check=True,
    )

    print(f"Berhasil: {OUT_DOCX}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())