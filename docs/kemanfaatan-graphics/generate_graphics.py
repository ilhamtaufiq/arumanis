#!/usr/bin/env python3
"""Generate infographic PNGs for Dokumen Kemanfaatan Inovasi Arumanis."""
from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).resolve().parent
W, H = 1600, 900  # 16:9 slides for Word / presentation

# Brand (align Arumanis remotion)
PURPLE = (124, 58, 237)
PURPLE_D = (91, 33, 182)
PINK = (236, 72, 153)
CYAN = (34, 211, 238)
GREEN = (52, 211, 153)
AMBER = (251, 191, 36)
SLATE_900 = (15, 23, 42)
SLATE_800 = (30, 41, 59)
SLATE_700 = (51, 65, 85)
WHITE = (255, 255, 255)
MUTED = (203, 213, 225)
SOFT = (241, 245, 249)


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        r"C:\Windows\Fonts\segoeuib.ttf" if bold else r"C:\Windows\Fonts\segoeui.ttf",
        r"C:\Windows\Fonts\arialbd.ttf" if bold else r"C:\Windows\Fonts\arial.ttf",
        r"C:\Windows\Fonts\calibrib.ttf" if bold else r"C:\Windows\Fonts\calibri.ttf",
    ]
    for p in candidates:
        try:
            return ImageFont.truetype(p, size)
        except OSError:
            continue
    return ImageFont.load_default()


def rounded_rect(draw: ImageDraw.ImageDraw, xy, r: int, fill, outline=None, width=1):
    draw.rounded_rectangle(xy, radius=r, fill=fill, outline=outline, width=width)


def gradient_bg(img: Image.Image, c1=SLATE_900, c2=PURPLE_D):
    px = img.load()
    w, h = img.size
    for y in range(h):
        t = y / max(h - 1, 1)
        r = int(c1[0] + (c2[0] - c1[0]) * t * 0.55)
        g = int(c1[1] + (c2[1] - c1[1]) * t * 0.55)
        b = int(c1[2] + (c2[2] - c1[2]) * t * 0.55)
        for x in range(w):
            # subtle horizontal vignette
            vx = abs(x - w / 2) / (w / 2)
            f = 1 - vx * 0.08
            px[x, y] = (int(r * f), int(g * f), int(b * f))


def text_w(draw, text, fnt):
    b = draw.textbbox((0, 0), text, font=fnt)
    return b[2] - b[0]


def wrap_text(draw, text, fnt, max_w):
    words = text.split()
    lines, cur = [], ""
    for w in words:
        trial = (cur + " " + w).strip()
        if text_w(draw, trial, fnt) <= max_w:
            cur = trial
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def footer(draw, note="Data live Arumanis · masih tahap sinkronisasi & harmonisasi"):
    f = font(16)
    draw.text((48, H - 40), note, font=f, fill=MUTED)
    draw.text((W - 48 - text_w(draw, "DISPERKIM Cianjur", f), H - 40), "DISPERKIM Cianjur", font=f, fill=MUTED)


def title_block(draw, title, subtitle):
    draw.text((48, 36), title, font=font(36, True), fill=WHITE)
    draw.text((48, 86), subtitle, font=font(20), fill=MUTED)
    # accent line
    draw.rounded_rectangle((48, 122, 220, 128), radius=3, fill=PINK)


# ---------- 01 ringkasan hero ----------
def make_01_ringkasan():
    img = Image.new("RGB", (W, H))
    gradient_bg(img)
    d = ImageDraw.Draw(img)
    title_block(d, "Ringkasan Kemanfaatan Arumanis", "Satu platform monitoring SPAM perdesaan & sanitasi air limbah")

    cards = [
        ("558", "Pekerjaan", "terpantau lintas tahun", PURPLE),
        ("364", "Unit SPAM", "33 SIMSPAM · 331 non", CYAN),
        ("167", "Infrastruktur sanitasi", "109 desa berinfrastruktur", GREEN),
        ("6.787", "Foto dokumentasi", "terindeks ber-GPS", PINK),
    ]
    gap, cw, ch = 28, 340, 280
    x0 = 48
    y0 = 170
    for i, (val, label, sub, accent) in enumerate(cards):
        x = x0 + i * (cw + gap)
        rounded_rect(d, (x, y0, x + cw, y0 + ch), 24, SLATE_800, accent, 3)
        d.ellipse((x + 24, y0 + 28, x + 64, y0 + 68), fill=accent)
        d.text((x + 28, y0 + 100), val, font=font(56, True), fill=WHITE)
        d.text((x + 28, y0 + 175), label, font=font(24, True), fill=SOFT)
        lines = wrap_text(d, sub, font(18), cw - 56)
        yy = y0 + 215
        for ln in lines:
            d.text((x + 28, yy), ln, font=font(18), fill=MUTED)
            yy += 26

    # bottom strip
    rounded_rect(d, (48, 500, W - 48, 780), 22, (20, 28, 48), (71, 85, 105), 2)
    d.text((80, 530), "Nilai platform (live · 9 Juli 2026)", font=font(22, True), fill=WHITE)
    bullets = [
        "Pengawas 29 orang · 33 lokasi — pelaporan mingguan terstruktur",
        "Cakupan SPM SPAM perdesaan 13,3% · sanitasi air limbah 1,9% (masih ditingkatkan)",
        "Nilai kontrak air Rp 92,27 M · investasi sanitasi Rp 63,99 M terkonsolidasi",
        "TFL Sanitasi DAK: 73 paket · Rp 27,10 M · 11.245 foto (tahun 2025)",
    ]
    y = 580
    for b in bullets:
        d.ellipse((88, y + 8, 104, y + 24), fill=PINK)
        d.text((120, y), b, font=font(20), fill=SOFT)
        y += 42

    footer(d)
    path = OUT / "01-ringkasan-kemanfaatan.png"
    img.save(path, "PNG", optimize=True)
    return path


# ---------- 02 SPM dual gauges ----------
def pie_arc(draw, cx, cy, r, pct, color, track=(51, 65, 85), width=28):
    # track full
    bbox = (cx - r, cy - r, cx + r, cy + r)
    draw.arc(bbox, start=0, end=360, fill=track, width=width)
    # progress from -90 deg (top), clockwise for PIL is opposite so use extent
    extent = min(360 * pct / 100, 359.9)
    # PIL arc is counter-clockwise from 3 o'clock; rotate: start=-90
    draw.arc(bbox, start=-90, end=-90 + extent, fill=color, width=width)


def make_02_spm_cakupan():
    img = Image.new("RGB", (W, H))
    gradient_bg(img, SLATE_900, (15, 40, 60))
    d = ImageDraw.Draw(img)
    title_block(d, "Capaian SPM — SPAM Perdesaan & Sanitasi Air Limbah", "Agregat live portal Arumanis (masih tahap harmonisasi)")

    # Left card SPAM
    rounded_rect(d, (60, 160, 760, 820), 28, SLATE_800, PURPLE, 3)
    d.text((100, 190), "SPAM Perdesaan", font=font(28, True), fill=WHITE)
    d.text((100, 230), "Terakumulasi s/d 2025 + integrasi 2026+", font=font(16), fill=MUTED)
    pie_arc(d, 410, 430, 150, 13.3, PURPLE, width=36)
    d.text((410 - text_w(d, "13,3%", font(48, True)) // 2, 400), "13,3%", font=font(48, True), fill=WHITE)
    d.text((410 - text_w(d, "cakupan KK", font(18)) // 2, 460), "cakupan KK", font=font(18), fill=MUTED)

    stats_l = [
        ("53.249 / 534.952", "KK terlayani / target"),
        ("266.229 jiwa · 53.265 SR", "Jiwa · sambungan rumah"),
        ("364 unit", "33 SIMSPAM · 331 non-SIMSPAM"),
        ("Rp 92,27 miliar", "Nilai kontrak terkonsolidasi"),
    ]
    y = 620
    for a, b in stats_l:
        d.text((100, y), a, font=font(20, True), fill=CYAN)
        d.text((100, y + 28), b, font=font(16), fill=MUTED)
        y += 48

    # Right sanitasi
    rounded_rect(d, (840, 160, 1540, 820), 28, SLATE_800, CYAN, 3)
    d.text((880, 190), "Sanitasi Air Limbah", font=font(28, True), fill=WHITE)
    d.text((880, 230), "167 unit berfungsi · 33 kecamatan", font=font(16), fill=MUTED)
    pie_arc(d, 1190, 430, 150, 1.9, CYAN, width=36)
    d.text((1190 - text_w(d, "1,9%", font(48, True)) // 2, 400), "1,9%", font=font(48, True), fill=WHITE)
    d.text((1190 - text_w(d, "cakupan KK", font(18)) // 2, 460), "cakupan KK", font=font(18), fill=MUTED)

    stats_r = [
        ("9.719 / 507.000", "KK pemanfaat / target"),
        ("48.595 jiwa", "Jiwa pemanfaat"),
        ("SPALD-T 56 · SPALD-S 107 · IPLT 1", "Jenis infrastruktur"),
        ("Rp 63,99 miliar", "Investasi terkonsolidasi"),
    ]
    y = 620
    for a, b in stats_r:
        d.text((880, y), a, font=font(20, True), fill=GREEN)
        d.text((880, y + 28), b, font=font(16), fill=MUTED)
        y += 48

    footer(d)
    path = OUT / "02-spm-cakupan-dual.png"
    img.save(path, "PNG", optimize=True)
    return path


# ---------- 03 tren tahunan bar ----------
def make_03_tren_tahunan():
    img = Image.new("RGB", (W, H))
    gradient_bg(img)
    d = ImageDraw.Draw(img)
    title_block(d, "Tren Capaian Tahunan SPAM Perdesaan", "Record capaian per tahun (API Arumanis)")

    years = [2009, 2014, 2020, 2021, 2022, 2023, 2024, 2025, 2026]
    records = [1, 1, 63, 59, 61, 55, 192, 71, 9]
    kk = [218, 215, 13125, 10696, 10312, 5920, 5093, 7552, 118]

    chart = (80, 180, W - 80, 720)
    left, top, right, bottom = chart
    rounded_rect(d, chart, 20, SLATE_800)

    max_r = max(records)
    n = len(years)
    pad_l, pad_b, pad_t = 70, 60, 40
    plot_w = right - left - pad_l - 40
    plot_h = bottom - top - pad_b - pad_t
    bar_w = plot_w / n * 0.55

    # grid
    for i in range(5):
        gy = top + pad_t + plot_h * i / 4
        d.line((left + pad_l, gy, right - 40, gy), fill=SLATE_700, width=1)
        val = int(max_r * (1 - i / 4))
        d.text((left + 16, gy - 10), str(val), font=font(14), fill=MUTED)

    colors = [PURPLE, PURPLE, CYAN, CYAN, GREEN, GREEN, PINK, AMBER, (167, 139, 250)]
    for i, (yr, rec) in enumerate(zip(years, records)):
        x = left + pad_l + (i + 0.5) * (plot_w / n) - bar_w / 2
        h = plot_h * (rec / max_r)
        y = top + pad_t + plot_h - h
        rounded_rect(d, (x, y, x + bar_w, top + pad_t + plot_h), 10, colors[i % len(colors)])
        d.text((x + bar_w / 2 - text_w(d, str(rec), font(16, True)) / 2, y - 26), str(rec), font=font(16, True), fill=WHITE)
        d.text((x + bar_w / 2 - text_w(d, str(yr), font(15)) / 2, top + pad_t + plot_h + 12), str(yr), font=font(15), fill=MUTED)

    d.text((80, 750), "Garis: jumlah record capaian. Puncak 2024 (192 record). 2026 = integrasi berjalan (9 record).", font=font(17), fill=MUTED)
    footer(d)
    path = OUT / "03-tren-capaian-tahunan.png"
    img.save(path, "PNG", optimize=True)
    return path


# ---------- 04 tiga peran ----------
def make_04_peran():
    img = Image.new("RGB", (W, H))
    gradient_bg(img, SLATE_900, (40, 20, 60))
    d = ImageDraw.Draw(img)
    title_block(d, "Kemanfaatan bagi Pengguna Lapangan", "Tiga peran · satu APIAMIS · cakupan berbeda")

    roles = [
        ("Pengawas", "11 akun · KPI skor rata-rata 104,4", [
            "54 pekerjaan · 667 foto (2026)",
            "Foto + GPS · progress · tiket",
            "Heartbeat lokasi · notifikasi realtime",
            "Hanya paket sesuai penugasan",
        ], PURPLE),
        ("Konsultan Pengawasan", "6 akun · KPI skor rata-rata 111", [
            "37 pekerjaan · 324 foto",
            "Verifikasi puspen & deviasi",
            "Lintas bidang & sumber dana",
            "Evaluasi tim lapangan",
        ], CYAN),
        ("TFL Sanitasi DAK", "Fokus SPALD / MCK / septik DAK", [
            "73 paket · Rp 27,10 miliar",
            "11.245 foto dokumentasi",
            "Modul SPM sanitasi air limbah",
            "Integrasi paket–infrastruktur",
        ], PINK),
    ]
    cw, ch = 460, 560
    y0 = 170
    for i, (name, sub, items, accent) in enumerate(roles):
        x = 70 + i * (cw + 40)
        rounded_rect(d, (x, y0, x + cw, y0 + ch), 26, SLATE_800, accent, 3)
        d.rounded_rectangle((x, y0, x + cw, y0 + 110), radius=26, fill=accent)
        # fix bottom of header (re-draw body top)
        d.rectangle((x, y0 + 70, x + cw, y0 + 110), fill=accent)
        d.text((x + 28, y0 + 28), name, font=font(26, True), fill=WHITE)
        d.text((x + 28, y0 + 68), sub, font=font(15), fill=SOFT)
        yy = y0 + 140
        for it in items:
            d.ellipse((x + 32, yy + 8, x + 48, yy + 24), fill=accent)
            for ln in wrap_text(d, it, font(18), cw - 90):
                d.text((x + 60, yy), ln, font=font(18), fill=SOFT)
                yy += 28
            yy += 16

    footer(d)
    path = OUT / "04-tiga-peran-lapangan.png"
    img.save(path, "PNG", optimize=True)
    return path


# ---------- 05 manfaat terukur ----------
def make_05_manfaat():
    img = Image.new("RGB", (W, H))
    gradient_bg(img)
    d = ImageDraw.Draw(img)
    title_block(d, "Manfaat Terukur Platform", "Indikator live → kemanfaatan operasional")

    rows = [
        ("558", "Pekerjaan terpantau", "Satu daftar lintas tahun & sumber dana", PURPLE),
        ("6.787", "Foto dokumentasi", "Bukti fisik terindeks, dilacak GPS", CYAN),
        ("29", "Pengawas aktif", "33 lokasi · pelaporan mingguan terstruktur", GREEN),
        ("2024–26", "Tren konstruksi", "2024:183 · 2025:241 · 2026:134 pekerjaan", PINK),
    ]
    y = 160
    for val, title, desc, accent in rows:
        rounded_rect(d, (60, y, W - 60, y + 140), 20, SLATE_800, accent, 2)
        d.rounded_rectangle((60, y, 280, y + 140), radius=20, fill=accent)
        d.rectangle((200, y, 280, y + 140), fill=accent)
        d.text((90, y + 45), val, font=font(36, True), fill=WHITE)
        d.text((320, y + 35), title, font=font(28, True), fill=WHITE)
        d.text((320, y + 80), desc, font=font(20), fill=MUTED)
        y += 160

    footer(d, "Bukan audit final · data multi-sumber masih diharmonisasi")
    path = OUT / "05-manfaat-terukur.png"
    img.save(path, "PNG", optimize=True)
    return path


# ---------- 06 rantai nilai ----------
def make_06_rantai():
    img = Image.new("RGB", (W, H))
    gradient_bg(img, SLATE_900, (30, 20, 70))
    d = ImageDraw.Draw(img)
    title_block(d, "Rantai Nilai Inovasi Arumanis", "Dari rencana hingga manfaat di Kabupaten Cianjur")

    nodes = [
        ("SIPD", "Perencanaan\n& anggaran", PURPLE),
        ("SPSE", "Pengadaan\npaket/kontrak", CYAN),
        ("Arumanis", "Pelaksanaan &\npengawasan", PINK),
        ("Manfaat", "Rekap SPM &\nintervensi desa", GREEN),
    ]
    nw, nh = 260, 200
    y = 280
    gap = 40
    total = len(nodes) * nw + (len(nodes) - 1) * gap
    x0 = (W - total) // 2
    for i, (t, sub, col) in enumerate(nodes):
        x = x0 + i * (nw + gap)
        rounded_rect(d, (x, y, x + nw, y + nh), 24, SLATE_800, col, 4)
        d.text((x + nw // 2 - text_w(d, t, font(28, True)) // 2, y + 40), t, font=font(28, True), fill=WHITE)
        for j, ln in enumerate(sub.split("\n")):
            d.text((x + nw // 2 - text_w(d, ln, font(18)) // 2, y + 100 + j * 28), ln, font=font(18), fill=MUTED)
        if i < len(nodes) - 1:
            ax = x + nw + 6
            ay = y + nh // 2
            d.polygon([(ax, ay - 10), (ax + 28, ay), (ax, ay + 10)], fill=PINK)

    rounded_rect(d, (120, 560, W - 120, 760), 20, (25, 20, 45), PINK, 2)
    lines = [
        "Pengawas & konsultan: alur input lapangan terstandar (foto GPS, progress, tiket).",
        "TFL: peta data integrasi SPM–pekerjaan khusus Sanitasi DAK.",
        "Pimpinan: ringkasan agregat SPAM perdesaan & sanitasi air limbah dari data live.",
    ]
    yy = 590
    for ln in lines:
        d.text((160, yy), "▸  " + ln, font=font(20), fill=SOFT)
        yy += 42

    footer(d)
    path = OUT / "06-rantai-nilai-integrasi.png"
    img.save(path, "PNG", optimize=True)
    return path


# ---------- 07 sanitasi jenis ----------
def make_07_sanitasi_jenis():
    img = Image.new("RGB", (W, H))
    gradient_bg(img)
    d = ImageDraw.Draw(img)
    title_block(d, "Infrastruktur Sanitasi Air Limbah", "167 unit berfungsi · sebaran jenis")

    items = [
        ("SPALD-S", 107, CYAN),
        ("SPALD-T", 56, PURPLE),
        ("IPLT", 1, AMBER),
    ]
    total = sum(v for _, v, _ in items)
    # horizontal stacked feel + cards
    x, y = 80, 200
    max_w = W - 160
    for name, val, col in items:
        bw = max(40, int(max_w * val / total))
        rounded_rect(d, (x, y, x + max_w, y + 120), 18, SLATE_800)
        rounded_rect(d, (x, y, x + bw, y + 120), 18, col)
        d.text((x + 24, y + 28), name, font=font(28, True), fill=WHITE)
        d.text((x + 24, y + 70), f"{val} unit  ({val / total * 100:.0f}%)", font=font(22), fill=SOFT)
        y += 150

    rounded_rect(d, (80, 680, W - 80, 800), 16, SLATE_800)
    d.text((110, 710), "Capaian SPM desa: 109 / 364 desa  ·  Desa belum infrastruktur: 255", font=font(22), fill=WHITE)
    d.text((110, 750), "Investasi terkonsolidasi Rp 63,99 miliar · 33 kecamatan", font=font(18), fill=MUTED)

    footer(d)
    path = OUT / "07-sanitasi-jenis.png"
    img.save(path, "PNG", optimize=True)
    return path


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    paths = [
        make_01_ringkasan(),
        make_02_spm_cakupan(),
        make_03_tren_tahunan(),
        make_04_peran(),
        make_05_manfaat(),
        make_06_rantai(),
        make_07_sanitasi_jenis(),
    ]
    readme = OUT / "README.md"
    readme.write_text(
        "# Grafik Kemanfaatan Inovasi Arumanis\n\n"
        "Dihasilkan dari data `Kemanfaatan-Inovasi-Arumanis.docx` (live 9 Juli 2026).\n\n"
        "| File | Isi |\n|------|-----|\n"
        "| `01-ringkasan-kemanfaatan.png` | KPI hero 558 / 364 / 167 / 6.787 |\n"
        "| `02-spm-cakupan-dual.png` | Dual gauge SPM SPAM vs sanitasi |\n"
        "| `03-tren-capaian-tahunan.png` | Bar tren record capaian |\n"
        "| `04-tiga-peran-lapangan.png` | Pengawas · Konsultan · TFL |\n"
        "| `05-manfaat-terukur.png` | Tabel visual manfaat platform |\n"
        "| `06-rantai-nilai-integrasi.png` | SIPD → SPSE → Arumanis → Manfaat |\n"
        "| `07-sanitasi-jenis.png` | SPALD-S / T / IPLT |\n\n"
        "Regenerate: `python docs/kemanfaatan-graphics/generate_graphics.py`\n",
        encoding="utf-8",
    )
    for p in paths:
        print(p)


if __name__ == "__main__":
    main()
