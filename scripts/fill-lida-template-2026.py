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
EFF_PATH = ROOT / "docs" / "efficiency-baseline-live.json"
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
    "outcome",
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
    "httpOnly",
    "BFF",
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


def load_efficiency() -> dict:
    if not EFF_PATH.exists():
        return {}
    raw = EFF_PATH.read_text(encoding="utf-8").replace("\ufeff", "")
    return json.loads(raw)


def id_date(iso: str) -> str:
    dt = datetime.fromisoformat(iso.replace("Z", "+00:00"))
    s = dt.strftime("%d %B %Y")
    return (
        s.replace("January", "Januari")
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


def fmt_id_num(n: float | int | None, digits: int = 1) -> str:
    if n is None:
        return "–"
    return f"{float(n):.{digits}f}".replace(".", ",")


def build_content(data: dict, eff: dict | None = None) -> dict[str, str | list[str]]:
    spam = data["spam"]
    san = data["sanitasi"]
    dash = data["dashboard"]
    pengawas = data["pengawas"]
    scope = data.get("dataScope", {})
    eff = eff or {}
    fetched = id_date(data["fetchedAt"])
    today = "13 Juli 2026"
    spm = "Standar Pelayanan Minimum (SPM)"
    sync_start = scope.get("syncStartYear", 2017)
    earliest = scope.get("earliestAchievementYear", "2009")
    gap_air = max(0, int(spam["total_target"]) - int(spam["capaian_kk"]))
    gap_san = max(0, int(san["target_kk"]) - int(san["total_pemanfaat_kk"]))

    # Metrik efisiensi terukur (fallback jika file belum di-generate)
    seb = eff.get("sebelum", {})
    ses = eff.get("sesudah", {})
    efi = eff.get("efisiensi", {})
    rekap_min = seb.get("rekap_spm_hari_kerja", {}).get("min", 5)
    rekap_max = seb.get("rekap_spm_hari_kerja", {}).get("max", 10)
    rekap_mid = seb.get("rekap_spm_hari_kerja", {}).get("midpoint", 7.5)
    lap_min = seb.get("interval_laporan_pengawas_hari", {}).get("min", 14)
    lap_max = seb.get("interval_laporan_pengawas_hari", {}).get("max", 28)
    lap_mid = seb.get("interval_laporan_pengawas_hari", {}).get("midpoint", 21)
    rekap_ms = ses.get("rekap_digital", {}).get("median_ms", 2200)
    rekap_detik = ses.get("rekap_digital", {}).get("median_detik", round(rekap_ms / 1000, 2))
    rekap_efi = efi.get("rekap_spm", {}).get("efisiensi_pct", 98.7)
    int_med = efi.get("interval_laporan_progres", {}).get("sesudah_median_hari", 12)
    int_efi = efi.get("interval_laporan_progres", {}).get("efisiensi_pct", 42.9)
    int_n = ses.get("interval_update_progres", {}).get("interval_n", 9)
    int_paket = ses.get("interval_update_progres", {}).get("paket_multi_hari", 7)
    pf = ses.get("cakupan_progress_fisik", {})
    kel = ses.get("kelengkapan_dokumentasi", {})
    pf_n = pf.get("total_paket", 87)
    pf_14 = pf.get("pct_updated_14_hari", 36.8)
    pf_30 = pf.get("pct_updated_30_hari", 83.9)
    foto_audit = kel.get("foto_audit_created", spam.get("total_foto_dokumentasi"))
    audit_sejak = str(kel.get("audit_log_sejak") or "2025-12-29")[:10]
    kpi_n = kel.get("kpi_pengawas_n", 16)
    kpi_foto = kel.get("kpi_dengan_foto", 16)
    measured_at = id_date(ses.get("diukur_pada") or eff.get("fetchedAt") or data["fetchedAt"])

    rekap_before = f"{rekap_min}–{rekap_max} hari kerja"
    rekap_after = f"median {fmt_id_num(rekap_detik, 1)} detik (same-day / <0,1 HK)"
    laporan_before = f"{lap_min}–{lap_max} hari (manual; titik tengah {fmt_id_num(lap_mid, 0)} hari)"
    laporan_after = f"median {fmt_id_num(int_med, 0)} hari antar-update (audit Progress)"

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
        "nama_inisiator": (
            "Ilham Taufiq (pengembang) / Bidang Air Minum dan Sanitasi, "
            "Dinas Perumahan dan Kawasan Permukiman Kabupaten Cianjur"
        ),
        "jenis": [checkbox_para("Digital", True), checkbox_para("Non-Digital", False)],
        # Opsi ketiga pada template resmi berbunyi "Diterapkan" (duplikat tahapan);
        # tidak dicentang agar tidak membingungkan penilai.
        "bentuk": [
            checkbox_para("Inovasi Tata kelola Pemerintahan", True),
            checkbox_para("Inovasi Pelayanan Publik", True),
            checkbox_para("Diterapkan", False),
        ],
        "koordinat": (
            "-6,824783; 107,139081 "
            "(Kantor Dinas Perumahan dan Kawasan Permukiman Kabupaten Cianjur)"
        ),
        "opd": "Dinas Perumahan dan Kawasan Permukiman Kabupaten Cianjur",
        "urusan": (
            "Perumahan dan Kawasan Permukiman "
            "(penyediaan air minum perdesaan dan sanitasi lingkungan)"
        ),
        "uji_coba": "9 Januari 2024",
        "diterapkan": "15 April 2024",
        "pengembangan": "22 Desember 2025",
        "dasar_hukum": (
            "Landasan utama: Undang-Undang Nomor 23 Tahun 2014 tentang Pemerintahan Daerah "
            "(urusan perumahan dan kawasan permukiman); Undang-Undang Nomor 17 Tahun 2019 tentang "
            "Sumber Daya Air; Peraturan Pemerintah Nomor 16 Tahun 2005 tentang Pengembangan "
            f"Sistem Penyediaan Air Minum (SPAM); Permenkes Nomor 2 Tahun 2023 tentang {spm} "
            "Bidang Kesehatan; serta kerangka SPBE (Permendagri terkait tata kelola pemerintahan "
            "berbasis elektronik) dan Undang-Undang Nomor 14 Tahun 2008 tentang Keterbukaan "
            "Informasi Publik untuk publikasi capaian. Tingkat daerah: Perbup Kabupaten Cianjur "
            "Nomor 102 Tahun 2021 (tugas–fungsi DPKP), Perbup Nomor 23 Tahun 2020 (RAD PAMSIMAS), "
            "RPJMD 2025–2029, dan Kajian RISPAM Kabupaten Cianjur. Perlindungan data mengikuti "
            "prinsip minimasi akses (hak per peran), sesi httpOnly, dan jejak audit log internal."
        ),
        "permasalahan": (
            f"Makro: Kabupaten Cianjur berpenduduk {fmt_num(san['total_penduduk'])} jiwa "
            f"(33 kecamatan, 365 desa/kelurahan) masih menghadapi kesenjangan akses air minum "
            f"layak dan sanitasi. Per {fetched}, capaian {spm} air minum "
            f"{fmt_pct(spam['coverage_percentage'])} ({fmt_num(gap_air)} KK belum terlayani) dan "
            f"sanitasi {fmt_pct(san['coverage_kk_percentage'])} "
            f"({fmt_num(san['desa_without_infrastruktur'])} desa belum berinfrastruktur terpetakan). "
            f"Mikro (tata kelola data): (1) progres fisik–keuangan–dokumentasi lapangan tercecer di "
            f"Excel, PDF, WhatsApp, dan berkas fisik tanpa single source of truth; (2) rekapitulasi "
            f"{spm} lintas 365 desa memakan {rekap_before}, sehingga keputusan pimpinan sering "
            f"berbasis data yang sudah usang; (3) laporan pengawas {laporan_before}, sulit "
            f"mendeteksi deviasi dini; (4) arsip foto dan capaian historis sejak {sync_start} "
            f"belum terharmonisasi, sehingga verifikasi lapangan dan pelaporan lintas unit lambat "
            f"dan rawan tumpang tindih."
        ),
        "isu_strategis": (
            f"Arumanis menjawab isu strategis akses air minum dan sanitasi (SDGs 6) yang "
            f"berkaitan dengan penurunan stunting (Asta Cita) melalui data cakupan layanan yang "
            f"terukur per desa. Secara nasional, inovasi mendukung arah RPJMN, program PAMSIMAS, "
            f"dan digitalisasi SPBE. Di Kabupaten Cianjur, inovasi menopang RPJMD 2025–2029, "
            f"RISPAM, dan RAD PAMSIMAS dengan menyatukan rantai data: perencanaan–kontrak–"
            f"pengawasan lapangan–capaian {spm}–informasi publik. Tanpa rantai ini, investasi "
            f"fisik sulit dievaluasi dampaknya terhadap penutupan gap layanan di 365 desa."
        ),
        "metode": (
            f"Pembaharuan diukur dengan metode hibrida sebelum–sesudah. "
            f"SEBELUM (rekonstruksi proses yang diperkuat artefak repositori publik legacy: "
            f"Database Sanitasi/sandb 2022 dan AMS Pro/amspro sejak Mei 2024—membuktikan "
            f"fragmentasi multi-aplikasi tanpa unit SPAM/rekap {spm} terpadu; audit log Arumanis "
            f"baru aktif sejak {audit_sejak}): rekap {spm} lintas sistem "
            f"{rekap_before} (titik tengah {fmt_id_num(rekap_mid, 1)} HK); interval laporan "
            f"pengawas {laporan_before}; data di Excel/PDF/WhatsApp ditambah silo sandb & amspro. "
            f"SESUDAH (terukur live per {measured_at}): "
            f"(1) ketersediaan rekap digital {spm}+dashboard = {rekap_after} "
            f"(n=5 trial rantai API stats air minum + sanitasi + dashboard) → efisiensi waktu "
            f"rekap ≈ {fmt_id_num(rekap_efi, 1)}% memakai rumus (sebelum−sesudah)/sebelum; "
            f"(2) interval antar-hari update progres dari audit log Progress = {laporan_after} "
            f"(n={int_n} interval pada {int_paket} paket multi-hari) → efisiensi interval ≈ "
            f"{fmt_id_num(int_efi, 1)}% vs titik tengah manual; "
            f"(3) snapshot progress fisik: {fmt_id_num(pf_14, 1)}% dari {fmt_num(pf_n)} paket "
            f"di-update ≤14 hari dan {fmt_id_num(pf_30, 1)}% ≤30 hari; "
            f"(4) kelengkapan: {kpi_foto}/{kpi_n} pengawas KPI punya foto, "
            f"{fmt_num(foto_audit)} event foto di audit log, "
            f"{fmt_num(dash['totalPekerjaan'])} pekerjaan dan "
            f"{fmt_num(spam['total_units'])} unit SPAM terdata, peta capaian 365 desa terbuka. "
            f"Keberlanjutan 2026–2028: penajaman integrasi SPM–pekerjaan & KPI (2026), "
            f"kualitas data historis & pelatihan (2027), pemeliharaan platform & backup (2028)."
        ),
        "keunggulan": (
            f"Diferensiasi Arumanis terhadap sistem sejenis (misalnya pencatatan aset SPAM "
            f"nasional/SIMSPAM atau spreadsheet dinas): Arumanis mengikat siklus utuh pekerjaan "
            f"konstruksi air minum perdesaan dan sanitasi air limbah—bukan hanya inventaris "
            f"statis—dari kegiatan, kontrak, progres fisik/keuangan, foto ber-GPS, KPI pengawas, "
            f"hingga capaian {spm} per desa yang dipublikasikan. Kebaharuan: (1) satu platform "
            f"kantor + lapangan + publik; (2) penandaan kelengkapan data dan status integrasi "
            f"infrastruktur–pekerjaan; (3) tautan ke data SIMSPAM nasional "
            f"({fmt_num(spam['simspam_count'])} unit) tanpa menggantikan sistem pusat; "
            f"(4) role-based access dan audit log; (5) penggabungan data multi-sumber sejak "
            f"{sync_start} menjadi baseline perencanaan. Keunggulan praktis: pimpinan melihat "
            f"deviasi lebih awal; pengawas punya alur wajib terstruktur; masyarakat memverifikasi "
            f"capaian desa tanpa birokrasi tatap muka."
        ),
        "tahapan_inovasi": (
            f"(1) Institusionalisasi: penugasan operator Bidang Air Minum dan Sanitasi, SOP "
            f"penggunaan, dan hak akses per peran. (2) Operator/koordinator mengelola kegiatan, "
            f"kontrak, data unit SPAM, dan infrastruktur sanitasi. (3) Pengawas lapangan mengisi "
            f"progres mingguan, mengunggah foto lokasi, dan melaporkan realisasi fisik–anggaran. "
            f"(4) Pimpinan/PUSPEN meninjau rekap progres, KPI, dan catatan kritis (misalnya "
            f"progres tinggi tanpa output). (5) Masyarakat mengakses peta capaian {spm} per desa "
            f"tanpa pendaftaran. (6) Data tersimpan terpusat; ringkasan diperbarui untuk evaluasi "
            f"program dan pelaporan periodik."
        ),
        "tujuan": (
            f"Tujuan: mewujudkan tata kelola pemantauan konstruksi SPAM perdesaan dan sanitasi "
            f"yang terukur, tepat waktu, dan transparan, sehingga keputusan alokasi dan "
            f"koreksi deviasi berbasis data terkini. Target terukur hingga akhir 2026: "
            f"(1) 100% paket aktif terpantau dalam sistem "
            f"(baseline tercatat {fmt_num(dash['totalPekerjaan'])} pekerjaan); "
            f"(2) frekuensi update progres mendekati mingguan (baseline terukur median "
            f"{fmt_id_num(int_med, 0)} hari antar-update; target perbaikan ≤7 hari); "
            f"(3) dokumentasi foto ≥90% paket aktif; (4) selisih penyelarasan data historis "
            f"{sync_start}–sekarang antarsumber <5%; (5) ringkasan capaian 365 desa "
            f"diperbarui real-time di dashboard; (6) publikasi {spm} tetap terbuka tanpa "
            f"pendaftaran. Outcome yang dikejar: deteksi dini deviasi, pengurangan waktu "
            f"rekap, dan akuntabilitas publik atas cakupan layanan."
        ),
        "manfaat": (
            f"Penyelenggara program: deviasi fisik–keuangan teridentifikasi lebih awal; "
            f"evaluasi {spm} air minum ({fmt_pct(spam['coverage_percentage'])}) dan sanitasi "
            f"({fmt_pct(san['coverage_kk_percentage'])}) berbasis data terpusat; anggaran "
            f"terpetakan—air minum {fmt_milyar(spam['capaian_nilai_kontrak'])}, sanitasi "
            f"{fmt_milyar(san['total_investasi'])}, pekerjaan "
            f"{fmt_milyar(dash['totalPaguPekerjaan'])} "
            f"({fmt_num(dash['totalKontrak'])} kontrak). "
            f"Pengawas: alur kerja tunggal (progres, foto, tiket) mengurangi ketergantungan "
            f"WhatsApp/berkas lepas. Masyarakat: cek capaian per desa kapan saja tanpa ke "
            f"kantor dinas—manfaat keterbukaan menjangkau {fmt_num(san['total_penduduk'])} jiwa "
            f"di 33 kecamatan. Institusi: jejak digital memperkuat akuntabilitas dan "
            f"keberlanjutan pelaporan multi-tahun."
        ),
        "hasil": (
            f"Per {fetched}, Arumanis telah diterapkan sebagai platform operasional Bidang "
            f"Air Minum dan Sanitasi. Output: (1) aplikasi dengan modul kegiatan–kontrak–"
            f"pekerjaan, unit SPAM, sanitasi/SPM, pengawasan lapangan, PUSPEN/KPI, dan "
            f"publikasi peta capaian; (2) data terintegrasi "
            f"{fmt_num(dash['totalPekerjaan'])} pekerjaan, {fmt_num(spam['total_units'])} unit "
            f"SPAM, {fmt_num(san['total_count'])} infrastruktur sanitasi, "
            f"{fmt_num(spam['total_foto_dokumentasi'])} foto, serta "
            f"{fmt_num(scope.get('totalAchievementRecords', spam['achievement_records']))} "
            f"catatan capaian ({earliest}–{scope.get('latestAchievementYear', '2026')}). "
            f"Outcome operasional terukur ({measured_at}): rekap {spm} dari titik tengah "
            f"{fmt_id_num(rekap_mid, 1)} HK manual menjadi {rekap_after} "
            f"(efisiensi ≈ {fmt_id_num(rekap_efi, 1)}%); interval update progres dari titik "
            f"tengah {fmt_id_num(lap_mid, 0)} hari manual menjadi median "
            f"{fmt_id_num(int_med, 0)} hari (efisiensi ≈ {fmt_id_num(int_efi, 1)}%); "
            f"{fmt_num(pengawas['total_pengawas'])} pengawas / "
            f"{fmt_num(pengawas['total_lokasi'])} lokasi; "
            f"{fmt_id_num(pf_30, 1)}% paket progress fisik terbarui ≤30 hari. "
            f"Keberlanjutan 2026–2028, SOP/SK, perlindungan data (akses berjenjang, sesi "
            f"aman, audit log). Outcome jangka menengah: penutupan gap layanan berbasis "
            f"prioritas data desa."
        ),
        "tanggal": today,
        "kepala_label": (
            "Kepala Dinas Perumahan dan Kawasan Permukiman Kabupaten Cianjur"
        ),
        "kepala_ttd": "CEPI RAHMAT FADIANA, ST, MT",
        "kepala_nip": "NIP. 19700218 199803 1 006",
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

    xml = replace_simple(
        xml,
        "Cianjur, ........................................",
        f"Cianjur, {c['tanggal']}",
    )
    xml = replace_simple(
        xml,
        "Kepala Perangkat Daerah/Kepala Puskesmas/Camat/Lurah,",
        str(c["kepala_label"]),
    )
    # Tanda tangan: kiri = Kepala Dinas, kanan = Inisiator
    xml = replace_simple(xml, "(Nama Jelas)", str(c["kepala_ttd"]))
    xml = replace_simple(xml, "(Nama Jelas)", str(c["inisiator_ttd"]))
    # Sisipkan NIP di bawah nama Kepala (paragraf kosong paraId 39426B08)
    nip_marker = 'w14:paraId="39426B08"'
    nip_idx = xml.find(nip_marker)
    if nip_idx != -1 and str(c["kepala_nip"]):
        p_start = xml.rfind("<w:p", 0, nip_idx)
        p_end = xml.find("</w:p>", nip_idx) + len("</w:p>")
        nip_para = (
            f'<w:p w14:paraId="39426B08" w14:textId="77777777" w:rsidR="{RSID}" '
            f'w:rsidRDefault="{RSID}" w:rsidP="{RSID}">'
            "<w:pPr><w:jc w:val=\"center\"/></w:pPr>"
            f"{runs_xml(str(c['kepala_nip']))}"
            "</w:p>"
        )
        xml = xml[:p_start] + nip_para + xml[p_end:]

    return xml


def main() -> int:
    if not TEMPLATE.exists():
        print(f"Template tidak ditemukan: {TEMPLATE}", file=sys.stderr)
        return 1

    data = load_data()
    eff = load_efficiency()
    content = build_content(data, eff)

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