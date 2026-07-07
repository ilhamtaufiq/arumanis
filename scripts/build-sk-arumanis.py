#!/usr/bin/env python3
"""Build SK Inovasi Arumanis from draft template."""
from __future__ import annotations

import re
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DRAFT = Path(r"C:\Users\asusg\Downloads\draft sk.docx")
SKILL_SCRIPTS = Path(r"C:\Users\asusg\.grok\skills\docx\scripts\office")
UNPACK_DIR = ROOT / "docs" / "_sk_arumanis_work"
OUTPUT = ROOT / "docs" / "SK_Inovasi_Arumanis_2026.docx"

FONT = "Bookman Old Style"
SZ = "24"


def esc(text: str) -> str:
    return (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


def rpr(extra: str = "") -> str:
    return (
        f'<w:rPr><w:rFonts w:ascii="{FONT}" w:eastAsia="{FONT}" '
        f'w:hAnsi="{FONT}" w:cs="{FONT}"/><w:sz w:val="{SZ}"/>'
        f'<w:szCs w:val="{SZ}"/>{extra}</w:rPr>'
    )


def run(text: str, extra: str = "") -> str:
    return f"<w:r>{rpr(extra)}<w:t>{esc(text)}</w:t></w:r>"


def run_space(text: str, extra: str = "") -> str:
    return f"<w:r>{rpr(extra)}<w:t xml:space=\"preserve\">{esc(text)}</w:t></w:r>"


def run_tabs(*parts: str, extra: str = "") -> str:
    inner = "".join(
        "<w:tab/>" if part == "\t" else f"<w:t>{esc(part)}</w:t>"
        for part in parts
    )
    return f"<w:r>{rpr(extra)}{inner}</w:r>"


def run_tabs_space(*parts: str, extra: str = "") -> str:
    inner = ""
    for part in parts:
        if part == "\t":
            inner += "<w:tab/>"
        elif part.startswith(" ") or part.endswith(" "):
            inner += f'<w:t xml:space="preserve">{esc(part)}</w:t>'
        else:
            inner += f"<w:t>{esc(part)}</w:t>"
    return f"<w:r>{rpr(extra)}{inner}</w:r>"


def para(
    content: str,
    *,
    center: bool = False,
    bold_label: str | None = None,
    indent_hanging: bool = False,
    left_indent: int | None = None,
    spacing_after: int | None = None,
) -> str:
    jc = '<w:jc w:val="center"/>' if center else '<w:jc w:val="both"/>'
    spacing = "<w:spacing w:line=\"240\" w:lineRule=\"auto\"/>"
    if spacing_after is not None:
        spacing = f'<w:spacing w:after="{spacing_after}" w:line="240" w:lineRule="auto"/>'
    ind = ""
    if indent_hanging:
        ind = '<w:ind w:left="2268" w:hanging="2268"/>'
    elif left_indent is not None:
        ind = f'<w:ind w:left="{left_indent}"/>'
    tabs = ""
    if indent_hanging:
        tabs = (
            "<w:tabs>"
            '<w:tab w:val="left" w:pos="1701"/>'
            '<w:tab w:val="left" w:pos="1843"/>'
            "</w:tabs>"
        )
    body = content
    if bold_label:
        body = (
            f"<w:r>{rpr('<w:b/><w:bCs/>')}<w:t>{esc(bold_label)}</w:t></w:r>"
            + content
        )
    return (
        "<w:p><w:pPr>"
        f"{tabs}{spacing}{ind}{jc}"
        f"{rpr()}"
        "</w:pPr>"
        f"{body}</w:p>"
    )


def menimbang_item(letter: str, text: str, *, first: bool = False) -> str:
    if first:
        head = run_tabs("Menimbang", "\t", ":", "\t", f"{letter}. ", "\t", "bahwa ")
    else:
        head = run_tabs("\t", f"  {letter}. bahwa ")
    return para(head + run(text) + run(";"), indent_hanging=True, spacing_after=0)


def mengingat_item(num: int, text: str, *, first: bool = False) -> str:
    if first:
        head = run_tabs("Mengingat", "\t", ":", "\t", f"{num}. ")
    else:
        head = run_tabs("\t", f"{num}. ")
    return para(head + run(text) + run(";"), indent_hanging=True, spacing_after=0)


def diktum(label: str, text: str, *, tasks: list[str] | None = None) -> str:
    parts = [para(run(label, "<w:b/><w:bCs/>"), spacing_after=0)]
    if tasks:
        parts.append(
            para(
                run(": Dalam melaksanakan tugas sebagaimana dimaksud pada Diktum KEDUA, "
                    "Tim Pelaksana Inovasi mempunyai tugas sebagai berikut:"),
                indent_hanging=True,
                spacing_after=0,
            )
        )
        for i, task in enumerate(tasks):
            letter = chr(ord("a") + i)
            parts.append(
                para(
                    run_tabs("\t", f"  {letter}. ")
                    + run(task)
                    + (run(";") if i < len(tasks) - 1 else run(".")),
                    indent_hanging=True,
                    spacing_after=0,
                )
            )
    else:
        parts.append(
            para(
                run(": ") + run(text) + run("."),
                indent_hanging=True,
                spacing_after=0,
            )
        )
    return "".join(parts)


def table_cell(text: str, *, header: bool = False, width: int) -> str:
    bold = "<w:b/><w:bCs/>" if header else ""
    shading = '<w:shd w:val="clear" w:color="auto" w:fill="D9E2F3"/>' if header else ""
    return (
        f'<w:tc><w:tcPr><w:tcW w:w="{width}" w:type="dxa"/>'
        f"<w:tcBorders>"
        '<w:top w:val="single" w:sz="4" w:space="0" w:color="auto"/>'
        '<w:left w:val="single" w:sz="4" w:space="0" w:color="auto"/>'
        '<w:bottom w:val="single" w:sz="4" w:space="0" w:color="auto"/>'
        '<w:right w:val="single" w:sz="4" w:space="0" w:color="auto"/>'
        "</w:tcBorders>"
        f"{shading}</w:tcPr>"
        f"<w:p><w:pPr><w:jc w:val=\"center\"/>{rpr(bold)}</w:pPr>"
        f"{run(text)}</w:p></w:tc>"
    )


def build_lampiran() -> str:
    rows = [
        ("1", "Penanggung Jawab", "Kepala Bidang Air Minum dan Sanitasi", "[Nama Lengkap]", "[NIP]"),
        ("2", "Ketua Tim", "Koordinator Inovasi / Inisiator", "Ilham Taufiq", "[NIP]"),
        ("3", "Sekretaris Tim", "Koordinator Program Kegiatan", "[Nama Lengkap]", "[NIP]"),
        ("4", "Anggota", "Operator Data", "[Nama Lengkap]", "[NIP]"),
        ("5", "Anggota", "Pengembang Sistem / Aplikasi", "[Nama Lengkap]", "[NIP]"),
        ("6", "Anggota", "Koordinator Pengawas Lapangan", "[Nama Lengkap]", "[NIP]"),
        ("7", "Anggota", "Staf Bidang Air Minum dan Sanitasi", "[Nama Lengkap]", "[NIP]"),
    ]
    widths = [720, 1800, 2880, 2160, 1800]
    header = (
        "<w:tr>"
        + table_cell("No", header=True, width=widths[0])
        + table_cell("Jabatan dalam Tim", header=True, width=widths[1])
        + table_cell("Uraian Tugas", header=True, width=widths[2])
        + table_cell("Nama", header=True, width=widths[3])
        + table_cell("NIP", header=True, width=widths[4])
        + "</w:tr>"
    )
    body_rows = []
    for row in rows:
        body_rows.append(
            "<w:tr>"
            + "".join(table_cell(col, width=widths[i]) for i, col in enumerate(row))
            + "</w:tr>"
        )
    table = (
        '<w:tbl><w:tblPr><w:tblW w:w="9360" w:type="dxa"/>'
        '<w:tblBorders>'
        '<w:top w:val="single" w:sz="4" w:space="0" w:color="auto"/>'
        '<w:left w:val="single" w:sz="4" w:space="0" w:color="auto"/>'
        '<w:bottom w:val="single" w:sz="4" w:space="0" w:color="auto"/>'
        '<w:right w:val="single" w:sz="4" w:space="0" w:color="auto"/>'
        '<w:insideH w:val="single" w:sz="4" w:space="0" w:color="auto"/>'
        '<w:insideV w:val="single" w:sz="4" w:space="0" w:color="auto"/>'
        "</w:tblBorders></w:tblPr>"
        + "<w:tblGrid>"
        + "".join(f'<w:gridCol w:w="{w}"/>' for w in widths)
        + "</w:tblGrid>"
        + header
        + "".join(body_rows)
        + "</w:tbl>"
    )
    return (
        para("", center=True)
        + para(run("LAMPIRAN I"), center=True)
        + para(
            run("KEPUTUSAN BUPATI CIANJUR"),
            center=True,
        )
        + para(run("NOMOR … TAHUN 2026"), center=True)
        + para(
            run("TENTANG PENETAPAN TIM PELAKSANA KEGIATAN INOVASI"),
            center=True,
        )
        + para(
            run('ARUMANIS (AIR MINUM DAN SANITASI)'),
            center=True,
        )
        + para(
            run("PADA DINAS PERUMAHAN DAN KAWASAN PERMUKIMAN KABUPATEN CIANJUR"),
            center=True,
        )
        + para("")
        + para(run("TIM PELAKSANA INOVASI ARUMANIS (AIR MINUM DAN SANITASI)"))
        + para("")
        + table
        + para("")
        + para(
            run("Keterangan: Susunan keanggotaan Tim dapat disesuaikan dengan kebutuhan operasional "
                "dan ditetapkan lebih lanjut oleh Penanggung Jawab Tim.")
        )
    )


def build_body_replacement(kop_drawing: str) -> str:
    tasks = [
        "menyusun rencana kerja penyelenggaraan inovasi Arumanis",
        "melaksanakan pemantauan pelaksanaan pekerjaan konstruksi Sistem Penyediaan Air Minum (SPAM) perdesaan dan pekerjaan sanitasi",
        "mengoordinasikan pelaksanaan inovasi pada Bidang Air Minum dan Sanitasi serta pengawas lapangan",
        "melaksanakan pembinaan dan pendampingan kepada operator data, pengawas lapangan, dan pengguna sistem",
        "melaksanakan pengumpulan, pengolahan, harmonisasi, dan pelaporan data SPAM, Standar Pelayanan Minimum (SPM), pekerjaan, serta dokumentasi lapangan",
        "melaksanakan monitoring dan evaluasi pelaksanaan inovasi",
        "menyusun laporan pelaksanaan inovasi",
    ]

    parts: list[str] = []

    # preserve top spacing + kop with image from draft
    parts.append(
        '<w:p w14:paraId="15459E1A" w14:textId="77777777" w:rsidR="009836FB" '
        'w:rsidRPr="00565D99" w:rsidRDefault="009836FB" w:rsidP="009836FB"/>'
    )
    parts.append(
        '<w:p w14:paraId="2ACF16C0" w14:textId="77777777" w:rsidR="009836FB" '
        'w:rsidRDefault="009836FB" w:rsidP="009836FB"><w:pPr><w:pStyle w:val="Title"/>'
        '<w:jc w:val="center"/><w:rPr><w:rFonts w:ascii="Arial MT"/><w:noProof/>'
        '<w:sz w:val="32"/><w:szCs w:val="32"/></w:rPr></w:pPr></w:p>'
    )
    parts.append(
        '<w:p w14:paraId="65A88C47" w14:textId="77777777" w:rsidR="009836FB" '
        'w:rsidRDefault="009836FB" w:rsidP="009836FB"><w:pPr><w:pStyle w:val="Title"/>'
        '<w:jc w:val="center"/><w:rPr><w:rFonts w:ascii="Arial MT"/><w:noProof/>'
        '<w:sz w:val="32"/><w:szCs w:val="32"/></w:rPr></w:pPr></w:p>'
    )

    kop_para = (
        '<w:p w14:paraId="0E1A7968" w14:textId="77777777" w:rsidR="009836FB" '
        'w:rsidRPr="00296C01" w:rsidRDefault="009836FB" w:rsidP="009836FB"><w:pPr>'
        '<w:pStyle w:val="Title"/><w:jc w:val="center"/><w:rPr>'
        f'<w:rFonts w:ascii="{FONT}" w:hAnsi="{FONT}" w:cs="Times New Roman"/>'
        '<w:b/><w:bCs/><w:color w:val="000000" w:themeColor="text1"/>'
        f'<w:sz w:val="{SZ}"/><w:szCs w:val="{SZ}"/></w:rPr></w:pPr><w:r><w:rPr>'
        '<w:rFonts w:ascii="Arial MT"/><w:noProof/>'
        '<w:sz w:val="32"/><w:szCs w:val="32"/></w:rPr>'
        f"{kop_drawing}"
        '<w:t xml:space="preserve">   DINAS PERUMAHAN DAN KAWASAN PERMUKIMAN</w:t>'
        '<w:br/><w:t>KABUPATEN CIANJUR</w:t></w:r></w:p>'
    )
    parts.append(kop_para)

    parts.append(para(run("KEPUTUSAN BUPATI CIANJUR"), center=True, spacing_after=0))
    parts.append(para(run("NOMOR … TAHUN 2026"), center=True, spacing_after=0))
    parts.append(para(run("TENTANG"), center=True, spacing_after=0))
    parts.append(
        para(
            run("PENETAPAN TIM PELAKSANA KEGIATAN INOVASI")
            + "<w:r>"
            + rpr()
            + '<w:br/><w:t>ARUMANIS (AIR MINUM DAN SANITASI)</w:t></w:r>',
            center=True,
            spacing_after=0,
        )
    )
    parts.append(
        para(
            run("PADA DINAS PERUMAHAN DAN KAWASAN PERMUKIMAN")
            + "<w:r>"
            + rpr()
            + '<w:br/><w:t>KABUPATEN CIANJUR</w:t></w:r>',
            center=True,
        )
    )
    parts.append(para(run("BUPATI CIANJUR,"), center=True))

    parts.append(
        menimbang_item(
            "a",
            "untuk meningkatkan pemantauan pelaksanaan pekerjaan konstruksi Sistem "
            "Penyediaan Air Minum (SPAM) perdesaan serta pekerjaan sanitasi, khususnya "
            "pengelolaan air limbah, di 32 (tiga puluh dua) kecamatan dan 360 (tiga ratus "
            "enam puluh) desa/kelurahan Kabupaten Cianjur, perlu dilaksanakan inovasi "
            "digital Arumanis (Air Minum dan Sanitasi)",
            first=True,
        )
    )
    parts.append(
        menimbang_item(
            "b",
            "agar pelaksanaan inovasi Arumanis dapat berjalan secara efektif, terarah, "
            "terukur, dan berkelanjutan dalam rangka mendukung peningkatan capaian Standar "
            "Pelayanan Minimum (SPM) bidang air minum dan sanitasi serta transformasi "
            "digital Sistem Pemerintahan Berbasis Elektronik (SPBE), perlu menetapkan "
            "penyelenggaraan inovasi beserta Tim Pelaksana Inovasi",
        )
    )
    parts.append(
        menimbang_item(
            "c",
            "berdasarkan pertimbangan sebagaimana dimaksud pada huruf a dan huruf b, "
            "perlu menetapkan Keputusan Bupati tentang Penetapan Tim Pelaksana Kegiatan "
            "Inovasi Arumanis (Air Minum dan Sanitasi) pada Dinas Perumahan dan Kawasan "
            "Permukiman Kabupaten Cianjur",
        )
    )
    parts.append(para(""))

    parts.append(
        mengingat_item(
            1,
            "Undang-Undang Nomor 23 Tahun 2014 tentang Pemerintahan Daerah "
            "(Lembaran Negara Republik Indonesia Tahun 2014 Nomor 244, Tambahan Lembaran "
            "Negara Republik Indonesia Nomor 5587) sebagaimana telah beberapa kali diubah "
            "terakhir dengan Undang-Undang Nomor 6 Tahun 2023 tentang Penetapan Peraturan "
            "Pemerintah Pengganti Undang-Undang Nomor 2 Tahun 2022 tentang Cipta Kerja "
            "Menjadi Undang-Undang (Lembaran Negara Republik Indonesia Tahun 2023 Nomor 41, "
            "Tambahan Lembaran Negara Republik Indonesia Nomor 6856)",
            first=True,
        )
    )
    parts.append(
        mengingat_item(
            2,
            "Undang-Undang Nomor 30 Tahun 2014 tentang Administrasi Pemerintahan "
            "(Lembaran Negara Republik Indonesia Tahun 2014 Nomor 292, Tambahan Lembaran "
            "Negara Republik Indonesia Nomor 5601) sebagaimana telah beberapa kali diubah "
            "terakhir dengan Undang-Undang Nomor 6 Tahun 2023 tentang Penetapan Peraturan "
            "Pemerintah Pengganti Undang-Undang Nomor 2 Tahun 2022 tentang Cipta Kerja "
            "Menjadi Undang-Undang (Lembaran Negara Republik Indonesia Tahun 2023 Nomor 41, "
            "Tambahan Lembaran Negara Republik Indonesia Nomor 6856)",
        )
    )
    parts.append(
        mengingat_item(
            3,
            "Undang-Undang Nomor 97 Tahun 2024 tentang Kabupaten Cianjur di Provinsi "
            "Jawa Barat (Lembaran Negara Republik Indonesia Tahun 2024 Nomor 283, Tambahan "
            "Lembaran Negara Republik Indonesia Nomor 7034)",
        )
    )
    parts.append(
        mengingat_item(
            4,
            "Peraturan Pemerintah Nomor 38 Tahun 2017 tentang Inovasi Daerah "
            "(Lembaran Negara Republik Indonesia Tahun 2017 Nomor 206, Tambahan Lembaran "
            "Negara Republik Indonesia Nomor 6123)",
        )
    )
    parts.append(
        mengingat_item(
            5,
            "Peraturan Menteri Dalam Negeri Nomor 104 Tahun 2018 tentang Penilaian dan "
            "Pemberian Penghargaan dan/atau Insentif Inovasi Daerah (Berita Negara Republik "
            "Indonesia Tahun 2018 Nomor 1611)",
        )
    )
    parts.append(
        mengingat_item(
            6,
            "Undang-Undang Nomor 17 Tahun 2019 tentang Sumber Daya Air (Lembaran Negara "
            "Republik Indonesia Tahun 2019 Nomor 190, Tambahan Lembaran Negara Republik "
            "Indonesia Nomor 6405)",
        )
    )
    parts.append(
        mengingat_item(
            7,
            "Peraturan Menteri Dalam Negeri Nomor 59 Tahun 2016 tentang Penerapan Sistem "
            "Pemerintahan Berbasis Elektronik (Berita Negara Republik Indonesia Tahun 2016 "
            "Nomor 789)",
        )
    )
    parts.append(
        mengingat_item(
            8,
            "Peraturan Bupati Cianjur Nomor 102 Tahun 2021 tentang Kedudukan, Susunan "
            "Organisasi, Tugas dan Fungsi serta Tata Kerja Dinas Perumahan dan Kawasan "
            "Permukiman Kabupaten Cianjur",
        )
    )
    parts.append(
        mengingat_item(
            9,
            "Peraturan Bupati Cianjur Nomor 23 Tahun 2020 tentang Rencana Aksi Daerah "
            "Penyediaan Air Minum dan Sanitasi Berbasis Masyarakat (PAMSIMAS) Kabupaten "
            "Cianjur Tahun 2019–2023",
        )
    )
    parts.append(para(""))

    parts.append(para(run("MEMUTUSKAN"), spacing_after=0))
    parts.append(para(run("Menetapkan"), spacing_after=0))
    parts.append(
        para(
            run("KEPUTUSAN BUPATI CIANJUR TENTANG PENETAPAN TIM PELAKSANA KEGIATAN ")
            + run("INOVASI ARUMANIS (AIR MINUM DAN SANITASI) PADA DINAS PERUMAHAN DAN ")
            + run("KAWASAN PERMUKIMAN KABUPATEN CIANJUR."),
            spacing_after=0,
        )
    )

    parts.append(
        diktum(
            "KESATU",
            "Menetapkan Arumanis (Air Minum dan Sanitasi) sebagai inovasi daerah di "
            "lingkungan Dinas Perumahan dan Kawasan Permukiman Kabupaten Cianjur dalam "
            "rangka pemantauan terintegrasi pekerjaan konstruksi SPAM perdesaan dan "
            "sanitasi, rekapitulasi capaian Standar Pelayanan Minimum (SPM), serta "
            "penyajian informasi layanan air minum dan sanitasi secara terbuka bagi masyarakat",
        )
    )
    parts.append(
        diktum(
            "KEDUA",
            "Membentuk Tim Pelaksana Inovasi Arumanis sebagaimana tercantum dalam "
            "Lampiran I yang merupakan bagian tidak terpisahkan dari Keputusan Bupati ini",
        )
    )
    parts.append(diktum("KETIGA", "", tasks=tasks))
    parts.append(
        diktum(
            "KEEMPAT",
            "Pembiayaan yang diperlukan untuk pelaksanaan tugas dan fungsi Tim Pelaksana "
            "Inovasi sebagaimana dimaksud pada Diktum KEDUA dan Diktum KETIGA bersumber "
            "dari Anggaran Pendapatan dan Belanja Daerah Kabupaten Cianjur",
        )
    )
    parts.append(
        diktum(
            "KELIMA",
            "Keputusan Bupati ini mulai berlaku pada tanggal ditetapkan",
        )
    )

    parts.append(para(""))
    parts.append(para(run("Ditetapkan di Cianjur"), left_indent=5040, spacing_after=0))
    parts.append(para(run("pada tanggal"), left_indent=5040, spacing_after=0))
    parts.append(para("", left_indent=5040))
    parts.append(para(run("a.n BUPATI CIANJUR"), left_indent=5040, spacing_after=0))
    parts.append(
        para(
            run("KEPALA DINAS PERUMAHAN DAN KAWASAN PERMUKIMAN"),
            left_indent=5040,
            spacing_after=0,
        )
    )
    for _ in range(5):
        parts.append(para("", left_indent=5040))
    parts.append(para(run("[NAMA KEPALA DINAS]"), left_indent=5040, spacing_after=0))
    parts.append(para(run("NIP. [……………]"), left_indent=5040))

    parts.append('<w:p><w:r><w:br w:type="page"/></w:r></w:p>')
    parts.append(build_lampiran())

    return "".join(parts)


def main() -> int:
    if not DRAFT.exists():
        print(f"Draft not found: {DRAFT}", file=sys.stderr)
        return 1

    if UNPACK_DIR.exists():
        shutil.rmtree(UNPACK_DIR)
    UNPACK_DIR.mkdir(parents=True, exist_ok=True)

    subprocess.run(
        [sys.executable, str(SKILL_SCRIPTS / "unpack.py"), str(DRAFT), str(UNPACK_DIR)],
        check=True,
    )

    doc_path = UNPACK_DIR / "word" / "document.xml"
    xml = doc_path.read_text(encoding="utf-8")

    kop_match = re.search(r"<w:drawing>.*?</w:drawing>", xml, re.DOTALL)
    if not kop_match:
        print("Kop drawing not found in draft", file=sys.stderr)
        return 1
    kop_drawing = kop_match.group(0)

    sect = re.search(r"<w:sectPr.*?</w:sectPr>", xml, re.DOTALL)
    if not sect:
        print("sectPr not found", file=sys.stderr)
        return 1

    new_body = build_body_replacement(kop_drawing) + sect.group(0)
    new_xml = re.sub(
        r"<w:body>.*?</w:body>",
        f"<w:body>{new_body}</w:body>",
        xml,
        count=1,
        flags=re.DOTALL,
    )
    doc_path.write_text(new_xml, encoding="utf-8")

    if OUTPUT.exists():
        OUTPUT.unlink()
    subprocess.run(
        [
            sys.executable,
            str(SKILL_SCRIPTS / "pack.py"),
            str(UNPACK_DIR),
            str(OUTPUT),
            "--original",
            str(DRAFT),
            "--validate",
            "false",
        ],
        check=True,
    )

    print(f"Created: {OUTPUT}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())