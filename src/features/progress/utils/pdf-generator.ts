import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import {
    drawReportPdfFooter,
    loadReportPdfLogosSelective,
    PDF_REPORT_FOOTER_MM,
    type ReportPdfLogos,
} from '@/features/pekerjaan/lib/export-pdf-branding'
import type { ProgressItemData, ProgressReportData } from '../types'
import type { SignatureData, DpaData } from '../types/signature'
import {
    getReportDate as getReportDateFromSpmk,
    getTanggalLaporanOtomatis,
    getSisaWaktu as getSisaWaktuHelper,
    getWaktuPelaksanaan as getWaktuPelaksanaanHelper,
    resolveKontrakStartDate,
} from './date-helpers'

type PdfCell =
    | string
    | number
    | {
          content: string | number
          colSpan?: number
          rowSpan?: number
          styles?: Record<string, string | number | boolean | number[]>
      }
type PdfRow = PdfCell[]
type PdfTable = PdfRow[]

interface JsPdfWithAutoTable extends jsPDF {
    lastAutoTable?: { finalY: number }
}

function getAutoTableFinalY(doc: jsPDF, fallback = 0): number {
    return (doc as JsPdfWithAutoTable).lastAutoTable?.finalY ?? fallback
}

/** Palet visual selaras export pekerjaan / Puspen */
const COLORS = {
    primary: [37, 99, 235] as [number, number, number],
    primaryDark: [30, 64, 175] as [number, number, number],
    headFill: [37, 99, 235] as [number, number, number],
    headText: 255,
    groupFill: [241, 245, 249] as [number, number, number],
    totalFill: [239, 246, 255] as [number, number, number],
    line: [203, 213, 225] as [number, number, number],
    muted: [71, 85, 105] as [number, number, number],
    ink: [15, 23, 42] as [number, number, number],
    white: 255,
}

/** Tinggi area kop 3-kolom (logo + dinas | penyedia | judul section) */
const MINGGUAN_HEADER_MM = 28

const MARGIN = {
    left: 12,
    right: 12,
    top: MINGGUAN_HEADER_MM,
    bottom: PDF_REPORT_FOOTER_MM + 2,
} as const

interface GeneratePdfProps {
    report: ProgressReportData
    weekCount: number
    weekNumbers?: number[]
    signatureData: SignatureData
    dpaData: DpaData
    /** Nama file unduhan (opsional); default unduh + buka tab */
    fileName?: string
    /** Logo AMS di kop (default: false) */
    showLogoAms?: boolean
    /** Logo Arumanis di kop (default: false) */
    showLogoArumanis?: boolean
}

const tableHeadStyles = {
    fillColor: COLORS.headFill,
    textColor: COLORS.headText,
    fontStyle: 'bold' as const,
    lineWidth: 0.12,
    lineColor: COLORS.line,
    fontSize: 6.5,
    halign: 'center' as const,
    valign: 'middle' as const,
}

const tableBodyStyles = {
    lineWidth: 0.1,
    lineColor: COLORS.line,
    textColor: COLORS.ink,
}

function drawInfoBox(
    doc: jsPDF,
    x: number,
    y: number,
    w: number,
    h: number,
) {
    doc.setDrawColor(...COLORS.primary)
    doc.setLineWidth(0.35)
    doc.setFillColor(248, 250, 252)
    doc.roundedRect(x, y, w, h, 1, 1, 'FD')
}

const META_LINE_H = 3.8

/**
 * Satu baris label + nilai (nilai boleh wrap).
 * Return tinggi yang dipakai (mm) agar baris berikutnya tidak tumpang-tindih.
 */
function drawMetaLine(
    doc: jsPDF,
    label: string,
    value: string,
    labelX: number,
    valueX: number,
    y: number,
    maxWidth: number,
): number {
    const safeValue = (value ?? '').toString().trim() || '-'
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7.5)
    doc.setTextColor(...COLORS.muted)
    doc.text(label, labelX, y)

    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...COLORS.ink)
    // Colon tetap di valueX agar rapi; nilai wrap di sisa lebar
    doc.text(':', valueX, y)
    const textMax = Math.max(20, maxWidth - 3)
    const lines = doc.splitTextToSize(safeValue, textMax)
    lines.forEach((line: string, idx: number) => {
        doc.text(line, valueX + 3, y + idx * META_LINE_H)
    })
    return Math.max(lines.length * META_LINE_H, META_LINE_H) + 1.2
}

/** Blok meta 2 kolom (kiri / kanan) — tinggi dinamis, tidak overlap. */
function drawMetaPanel(
    doc: jsPDF,
    x: number,
    y: number,
    width: number,
    leftRows: Array<[string, string]>,
    rightRows: Array<[string, string]>,
): number {
    const padX = 3.5
    const padY = 4
    const gapCols = 10
    const half = (width - gapCols) / 2

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7.5)
    const longestLabel = [...leftRows, ...rightRows].reduce((max, [label]) => {
        return Math.max(max, doc.getTextWidth(label))
    }, 0)
    const labelW = Math.min(36, Math.max(22, longestLabel + 2))

    const leftLabelX = x + padX
    const leftValueX = x + padX + labelW
    const leftMax = half - labelW - padX - 2
    const rightLabelX = x + half + gapCols + padX
    const rightValueX = rightLabelX + labelW
    const rightMax = half - labelW - padX - 2

    // Ukur dulu tinggi
    const measure = (rows: Array<[string, string]>, maxW: number) =>
        rows.reduce((sum, [, value]) => {
            const safe = (value ?? '').toString().trim() || '-'
            const lines = doc.splitTextToSize(safe, Math.max(18, maxW - 3))
            return sum + Math.max(lines.length * META_LINE_H, META_LINE_H) + 1.2
        }, 0)

    const boxH = Math.max(measure(leftRows, leftMax), measure(rightRows, rightMax)) + padY * 2
    drawInfoBox(doc, x, y, width, boxH)

    let ly = y + padY + 1
    leftRows.forEach(([label, value]) => {
        ly += drawMetaLine(doc, label, value, leftLabelX, leftValueX, ly, leftMax)
    })
    let ry = y + padY + 1
    rightRows.forEach(([label, value]) => {
        ry += drawMetaLine(doc, label, value, rightLabelX, rightValueX, ry, rightMax)
    })

    return boxH
}

/**
 * Kop 3 section untuk laporan mingguan:
 * kiri  = logo Cianjurkab + identitas dinas/bidang
 * tengah = nama penyedia
 * kanan = judul section (mis. Rekapitulasi) + minggu + tanggal
 * Tidak ada judul di bawah garis (sudah dipindah ke kolom kanan).
 */
function drawMingguanThreeColumnHeader(
    doc: jsPDF,
    options: {
        logos: ReportPdfLogos
        penyediaName: string
        /** Judul section di kanan, mis. "Uraian Progress" / "Rekapitulasi" */
        sectionLabel: string
        weekNumber: number
        reportDateLabel: string
        marginLeft: number
        marginRight: number
        continuation?: boolean
    },
): number {
    const pageW = doc.internal.pageSize.getWidth()
    const left = options.marginLeft
    const right = pageW - options.marginRight
    const contentW = right - left
    const topY = 4
    const logoH = 15
    const gapAfterLogo = 3.5
    const colW = contentW / 3

    // ── Kiri: logo + identitas ──────────────────────────────────────────
    if (options.logos.cianjurDataUrl) {
        try {
            doc.addImage(
                options.logos.cianjurDataUrl,
                'PNG',
                left,
                topY,
                logoH,
                logoH,
                undefined,
                'FAST',
            )
        } catch {
            // skip
        }
    }

    const leftTextX = left + logoH + 2.5
    const leftTextMax = colW - logoH - 4
    let ly = topY + 3.5
    doc.setTextColor(...COLORS.ink)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7)
    const leftLines = [
        'PEMERINTAH KABUPATEN CIANJUR',
        'DINAS PERUMAHAN DAN KAWASAN PERMUKIMAN',
    ]
    leftLines.forEach((line) => {
        const wrapped = doc.splitTextToSize(line, leftTextMax)
        doc.text(wrapped, leftTextX, ly)
        ly += wrapped.length * 3.2
    })
    doc.setFontSize(7)
    doc.setTextColor(...COLORS.primaryDark)
    doc.text(
        doc.splitTextToSize('Bidang Air Minum dan Sanitasi', leftTextMax),
        leftTextX,
        ly,
    )

    // ── Tengah: nama penyedia ───────────────────────────────────────────
    const centerX = left + colW + colW / 2
    const centerMax = colW - 6
    doc.setTextColor(...COLORS.muted)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6.5)
    doc.text('PENYEDIA / KONTRAKTOR', centerX, topY + 4, {
        align: 'center',
        maxWidth: centerMax,
    })
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(...COLORS.ink)
    const penyediaLines = doc.splitTextToSize(
        options.penyediaName?.trim() || '-',
        centerMax,
    )
    doc.text(penyediaLines, centerX, topY + 9, { align: 'center' })

    // ── Kanan: judul section + minggu + tanggal ─────────────────────────
    const rightColLeft = left + colW * 2 + 2
    const rightMax = colW - 4
    let ry = topY + 3.5
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.5)
    doc.setTextColor(...COLORS.ink)
    const titleLines = doc.splitTextToSize('LAPORAN MINGGUAN FISIK', rightMax)
    doc.text(titleLines, rightColLeft, ry)
    ry += titleLines.length * 3.5 + 0.5

    doc.setFontSize(8)
    doc.setTextColor(...COLORS.primaryDark)
    const sectionLines = doc.splitTextToSize(options.sectionLabel, rightMax)
    doc.text(sectionLines, rightColLeft, ry)
    ry += sectionLines.length * 3.3

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(...COLORS.ink)
    doc.text(`Minggu ke-${options.weekNumber}`, rightColLeft, ry)
    ry += 3.5
    doc.setTextColor(...COLORS.muted)
    doc.text(
        options.continuation
            ? `${options.reportDateLabel} · lanjutan`
            : options.reportDateLabel,
        rightColLeft,
        ry,
    )

    // Garis pemisah — tanpa judul di bawahnya
    const logoBottom = topY + logoH
    let ty = Math.max(logoBottom, ry + 1, topY + 16) + gapAfterLogo
    doc.setDrawColor(...COLORS.primary)
    doc.setLineWidth(0.45)
    doc.line(left, ty, right, ty)
    doc.setDrawColor(148, 163, 184)
    doc.setLineWidth(0.2)
    doc.line(left, ty + 0.85, right, ty + 0.85)
    ty += 3.5

    doc.setTextColor(0)
    return Math.max(ty, MINGGUAN_HEADER_MM)
}

function safeLogo(
    doc: jsPDF,
    dataUrl: string | null,
    x: number,
    y: number,
    w: number,
    h: number,
) {
    if (!dataUrl) return
    try {
        doc.addImage(dataUrl, 'PNG', x, y, w, h, undefined, 'FAST')
    } catch {
        // skip
    }
}

/** Bersihkan lokasi kosong / karakter aneh (', ", . saja). */
function cleanDisplayText(value: unknown, fallback = '—'): string {
    const raw = String(value ?? '')
        .replace(/\u00a0/g, ' ')
        .trim()
    if (!raw) return fallback
    // Hanya tanda baca / kutip tanpa teks bermakna
    if (/^[\s'".,;:\-–—_/\\|]+$/.test(raw)) return fallback
    return raw
}

/** Format kuantitas: satuan dulu, baru volume (mis. `m 12,5`). */
function formatSatuanLaluVolume(
    satuan: string | null | undefined,
    volume: number | string | null | undefined,
): string {
    const unit = String(satuan ?? '').trim()
    if (volume === null || volume === undefined || volume === '') {
        return unit || '-'
    }
    const vol =
        typeof volume === 'number'
            ? Number.isFinite(volume)
                ? String(volume)
                : ''
            : String(volume).trim()
    if (unit && vol !== '') return `${unit} ${vol}`
    return unit || vol || '-'
}

function weekRealisasi(
    weeklyData: ProgressItemData['weekly_data'] | undefined,
    week: number,
): number {
    if (!weeklyData) return 0
    const cell = weeklyData[week] ?? weeklyData[String(week) as unknown as number]
    return Number(cell?.realisasi ?? 0) || 0
}

/** Progress berbobot s.d. minggu tertentu (realisasi item × bobot). */
function computeWeightedProgressUntilWeek(
    items: ProgressItemData[],
    weekNumber: number,
): number {
    let total = 0
    const wMax = Math.max(1, weekNumber)
    for (const item of items) {
        const weeklyData = item.weekly_data ?? {}
        let accum = 0
        for (let w = 1; w <= wMax; w++) {
            accum += Number(weeklyData[w]?.realisasi ?? 0) || 0
        }
        const targetVol = Number(item.target_volume) || 0
        const bobot = Number(item.bobot) || 0
        const pct = targetVol > 0 ? (accum / targetVol) * 100 : 0
        total += (pct * bobot) / 100
    }
    return Math.round(total * 100) / 100
}

/**
 * Halaman cover (landscape) — ringkasan identitas paket sebelum isi laporan.
 */
function drawLaporanMingguanCover(
    doc: jsPDF,
    options: {
        logos: ReportPdfLogos
        showAms: boolean
        showArumanis: boolean
        report: ProgressReportData
        signatureData: SignatureData
        dpaData: DpaData
        weeksLabel: string
        tanggalLaporan: string
        periodeMinggu: string
        progressTotal: number
        lokasiText: string
        penyediaName: string
        waktuPelaksanaan: number
    },
) {
    const pageW = doc.internal.pageSize.getWidth()
    const pageH = doc.internal.pageSize.getHeight()
    const left = MARGIN.left
    const right = pageW - MARGIN.right
    const contentW = right - left
    const centerX = pageW / 2

    // Background accent strip kiri
    doc.setFillColor(...COLORS.primary)
    doc.rect(0, 0, 6, pageH, 'F')
    doc.setFillColor(239, 246, 255)
    doc.rect(6, 0, 4, pageH, 'F')

    // Top logos
    const logoH = 16
    const topY = 8
    safeLogo(doc, options.logos.cianjurDataUrl, left + 6, topY, logoH, logoH)

    let rightX = right
    if (options.showArumanis && options.logos.arumanisDataUrl) {
        rightX -= logoH
        safeLogo(doc, options.logos.arumanisDataUrl, rightX, topY, logoH, logoH)
        rightX -= 2.5
    }
    if (options.showAms && options.logos.amsDataUrl) {
        const amsW = logoH * 1.71
        rightX -= amsW
        safeLogo(doc, options.logos.amsDataUrl, rightX, topY, amsW, logoH)
    }

    // Institution
    let y = topY + 2
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(...COLORS.ink)
    doc.text('PEMERINTAH KABUPATEN CIANJUR', centerX, y, { align: 'center' })
    y += 4.5
    doc.setFontSize(9)
    doc.text('DINAS PERUMAHAN DAN KAWASAN PERMUKIMAN', centerX, y, { align: 'center' })
    y += 4
    doc.setFontSize(8.5)
    doc.setTextColor(...COLORS.primaryDark)
    doc.text('Bidang Air Minum dan Sanitasi', centerX, y, { align: 'center' })
    y += 4.5

    doc.setDrawColor(...COLORS.primary)
    doc.setLineWidth(0.55)
    doc.line(left + 36, y, right - 36, y)
    y += 6

    // Document title
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7.5)
    doc.setTextColor(...COLORS.muted)
    doc.text('DOKUMEN LAPORAN', centerX, y, { align: 'center' })
    y += 5.5
    doc.setFontSize(16)
    doc.setTextColor(...COLORS.ink)
    doc.text('LAPORAN MINGGUAN FISIK', centerX, y, { align: 'center' })
    y += 5.5
    doc.setFontSize(10)
    doc.setTextColor(...COLORS.primaryDark)
    doc.text(options.weeksLabel, centerX, y, { align: 'center' })
    y += 4
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(...COLORS.muted)
    doc.text(options.periodeMinggu, centerX, y, { align: 'center' })
    y += 5.5

    // Paket name banner
    const paketLines = doc.splitTextToSize(
        cleanDisplayText(options.report.pekerjaan.nama, '—'),
        contentW - 28,
    )
    const bannerH = Math.max(12, paketLines.length * 5 + 6)
    doc.setFillColor(...COLORS.primary)
    doc.roundedRect(left + 6, y, contentW - 12, bannerH, 1.5, 1.5, 'F')
    doc.setTextColor(255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    const bannerTextY = y + bannerH / 2 + 1.2 - ((paketLines.length - 1) * 2.4)
    doc.text(paketLines, centerX, bannerTextY, { align: 'center' })
    y += bannerH + 5

    const fmtDate = (v: string | null | undefined) =>
        v ? new Date(v).toLocaleDateString('id-ID') : '—'
    const fmtMoney = (n: number | null | undefined) =>
        n != null && Number(n) > 0
            ? `Rp${new Intl.NumberFormat('id-ID').format(Math.round(Number(n)))}`
            : '—'

    const leftInfo: Array<[string, string]> = [
        ['Kegiatan', cleanDisplayText(options.report.kegiatan?.nama_kegiatan)],
        ['Sub Kegiatan', cleanDisplayText(options.report.kegiatan?.nama_sub_kegiatan)],
        ['Lokasi', cleanDisplayText(options.lokasiText)],
        [
            'Tahun Anggaran',
            cleanDisplayText(options.report.kegiatan?.tahun_anggaran),
        ],
        [
            'Sumber Dana',
            cleanDisplayText(options.report.kegiatan?.sumber_dana, 'APBD'),
        ],
        ['Pagu Paket', fmtMoney(options.report.pekerjaan.pagu)],
    ]
    const rightInfo: Array<[string, string]> = [
        ['Penyedia', cleanDisplayText(options.penyediaName)],
        [
            'Direktur',
            cleanDisplayText(
                options.report.penyedia?.direktur || options.signatureData.namaDirektur,
            ),
        ],
        [
            'Pengawas',
            cleanDisplayText(
                options.report.pengawas?.nama || options.signatureData.namaDiperiksa,
            ),
        ],
        [
            'PPTK',
            cleanDisplayText(
                options.report.kegiatan?.nama_pptk || options.signatureData.namaMengetahui,
            ),
        ],
        ['No. SPMK', cleanDisplayText(options.report.kontrak?.spmk)],
        ['No. SPK / Kontrak', cleanDisplayText(options.report.kontrak?.spk)],
        ['Nilai Kontrak', fmtMoney(options.report.kontrak?.nilai_kontrak ?? null)],
        [
            'Waktu Pelaksanaan',
            options.waktuPelaksanaan > 0
                ? `${options.waktuPelaksanaan} hari kalender`
                : '—',
        ],
        [
            'SPMK – Selesai',
            `${fmtDate(options.report.kontrak?.tgl_spmk)} – ${fmtDate(options.report.kontrak?.tgl_selesai)}`,
        ],
        ['No. DPA', cleanDisplayText(options.dpaData.nomorDpa)],
    ]

    // Tabel 4 kolom berpasangan — tidak terpotong, rapi
    const maxRows = Math.max(leftInfo.length, rightInfo.length)
    const tableBody: string[][] = []
    for (let i = 0; i < maxRows; i++) {
        const L = leftInfo[i]
        const R = rightInfo[i]
        tableBody.push([
            L?.[0] ?? '',
            L?.[1] ?? '',
            R?.[0] ?? '',
            R?.[1] ?? '',
        ])
    }

    autoTable(doc, {
        startY: y,
        body: tableBody,
        theme: 'plain',
        tableWidth: contentW - 12,
        margin: { left: left + 6, right: MARGIN.right + 6, bottom: 28 },
        styles: {
            fontSize: 7.5,
            cellPadding: { top: 1.4, bottom: 1.4, left: 2, right: 2 },
            valign: 'top',
            overflow: 'linebreak',
            textColor: COLORS.ink,
            lineColor: COLORS.line,
            lineWidth: 0.05,
        },
        columnStyles: {
            0: {
                cellWidth: 28,
                fontStyle: 'bold',
                textColor: COLORS.muted,
                fontSize: 6.5,
            },
            1: { cellWidth: (contentW - 12) / 2 - 28, fontSize: 7.5 },
            2: {
                cellWidth: 32,
                fontStyle: 'bold',
                textColor: COLORS.muted,
                fontSize: 6.5,
            },
            3: { cellWidth: (contentW - 12) / 2 - 32, fontSize: 7.5 },
        },
        didParseCell: (data) => {
            // zebra row
            if (data.section === 'body' && data.row.index % 2 === 0) {
                data.cell.styles.fillColor = [248, 250, 252]
            }
        },
    })

    y = getAutoTableFinalY(doc, y) + 5

    // Progress + tanggal di satu strip
    const prog = Number.isFinite(options.progressTotal)
        ? options.progressTotal.toFixed(2)
        : '0.00'
    const stripH = 16
    // Pastikan muat di atas footer cover
    if (y + stripH > pageH - 16) {
        y = pageH - 16 - stripH
    }
    doc.setFillColor(239, 246, 255)
    doc.setDrawColor(...COLORS.primary)
    doc.setLineWidth(0.35)
    doc.roundedRect(left + 6, y, contentW - 12, stripH, 1.5, 1.5, 'FD')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(...COLORS.primaryDark)
    doc.text(
        `Progress Fisik (berbobot) s.d. periode laporan:  ${prog} %`,
        centerX,
        y + 6,
        { align: 'center' },
    )
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...COLORS.ink)
    doc.text(`Tanggal Laporan: ${options.tanggalLaporan}`, centerX, y + 12, {
        align: 'center',
    })

    // Bottom note
    doc.setDrawColor(...COLORS.primary)
    doc.setLineWidth(0.3)
    doc.line(left + 40, pageH - 10, right - 40, pageH - 10)
    doc.setFontSize(7)
    doc.setTextColor(...COLORS.muted)
    doc.text(
        'Dokumen ini dihasilkan dari aplikasi Arumanis · Bidang Air Minum dan Sanitasi · Disperkim Cianjur',
        centerX,
        pageH - 6,
        { align: 'center' },
    )
    doc.setTextColor(0)
}

export const generatePdf = async ({
    report,
    weekCount,
    weekNumbers,
    signatureData,
    dpaData,
    fileName,
    showLogoAms = false,
    showLogoArumanis = false,
}: GeneratePdfProps) => {
    if (!report) return

    const logoVisibility = {
        showCianjur: true,
        showAms: showLogoAms,
        showArumanis: showLogoArumanis,
    }
    const logos: ReportPdfLogos = await loadReportPdfLogosSelective(logoVisibility)

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const contentWidth = pageWidth - MARGIN.left - MARGIN.right
    const centerX = pageWidth / 2

    const drawPageFooter = () => {
        const total = doc.getNumberOfPages()
        // Halaman 1 = cover: footer tanpa "Halaman" di tepi, tetap branding
        for (let i = 1; i <= total; i++) {
            doc.setPage(i)
            if (i === 1) {
                // cover sudah punya footer sendiri
                continue
            }
            drawReportPdfFooter(doc, {
                pageNumber: i - 1,
                totalPages: total - 1,
                marginLeft: MARGIN.left,
                marginRight: MARGIN.right,
            })
        }
    }

    const penyediaName =
        report.penyedia?.nama || signatureData.namaPerusahaan || '-'

    const paintKop = (
        sectionLabel: string,
        weekNo: number,
        dateLabel: string,
        continuation = false,
    ) => {
        return drawMingguanThreeColumnHeader(doc, {
            logos,
            penyediaName,
            sectionLabel,
            weekNumber: weekNo,
            reportDateLabel: dateLabel,
            marginLeft: MARGIN.left,
            marginRight: MARGIN.right,
            continuation,
        })
    }

    // ── COVER (halaman pertama) ─────────────────────────────────────────
    const weeksToRender = weekNumbers?.length ? weekNumbers : [weekCount]
    const firstWeek = weeksToRender[0] ?? weekCount
    const lastWeek = weeksToRender[weeksToRender.length - 1] ?? weekCount
    const weeksLabel =
        weeksToRender.length > 1
            ? `Minggu ke-${firstWeek} s/d Minggu ke-${lastWeek}`
            : `Minggu ke-${firstWeek}`
    const tglMulaiCover = resolveKontrakStartDate(report.kontrak)
    const periodeMinggu = getTanggalLaporanOtomatis(tglMulaiCover, {
        weekNumber: firstWeek,
        throughWeek: lastWeek,
    })
    const lokasiPartsCover: string[] = []
    const desa = cleanDisplayText(report.pekerjaan.desa_nama, '')
    const kec = cleanDisplayText(report.pekerjaan.kecamatan_nama, '')
    if (desa) lokasiPartsCover.push(`Desa ${desa}`)
    if (kec) lokasiPartsCover.push(`Kecamatan ${kec}`)
    const lokasiFallback = cleanDisplayText(report.pekerjaan.lokasi, '')
    const lokasiTextCover =
        lokasiPartsCover.length > 0
            ? lokasiPartsCover.join(' ')
            : lokasiFallback || '—'

    // Progress cover = realisasi berbobot s.d. minggu terakhir yang dicetak
    // (bukan totals API yang sering 0 / stale)
    const progressCover = computeWeightedProgressUntilWeek(
        report.items ?? [],
        lastWeek,
    )

    drawLaporanMingguanCover(doc, {
        logos,
        showAms: showLogoAms,
        showArumanis: showLogoArumanis,
        report,
        signatureData,
        dpaData,
        weeksLabel,
        tanggalLaporan: signatureData.tanggal || periodeMinggu,
        periodeMinggu,
        progressTotal: progressCover,
        lokasiText: lokasiTextCover,
        penyediaName,
        waktuPelaksanaan: getWaktuPelaksanaanHelper(
            tglMulaiCover,
            report.kontrak?.tgl_selesai,
        ),
    })

    const renderWeek = (weekCount: number) => {
        // Selalu halaman baru setelah cover
        doc.addPage('a4', 'landscape')

        const tglMulai = resolveKontrakStartDate(report.kontrak)
        const reportDate = getReportDateFromSpmk(tglMulai, weekCount)
        // Header: rentang minggu mulai–selesai (mulai kontrak). Signature pakai signatureData.tanggal.
        const weekRangeLabel = getTanggalLaporanOtomatis(tglMulai, {
            weekNumber: weekCount,
        })
        const reportDateLabel = `Tanggal: ${weekRangeLabel}`
        const waktuPelaksanaan = getWaktuPelaksanaanHelper(
            tglMulai,
            report.kontrak?.tgl_selesai,
        )
        const sisaWaktu = getSisaWaktuHelper(report.kontrak?.tgl_selesai, reportDate)
        const lokasiParts: string[] = []
        if (report.pekerjaan.desa_nama) lokasiParts.push(`Desa ${report.pekerjaan.desa_nama}`)
        if (report.pekerjaan.kecamatan_nama) {
            lokasiParts.push(`Kecamatan ${report.pekerjaan.kecamatan_nama}`)
        }
        const lokasiText =
            lokasiParts.length > 0
                ? lokasiParts.join(' ')
                : (report.pekerjaan.lokasi || '').trim() || '-'

        // ── Kop 3 section + meta paket (tinggi dinamis, tanpa overlap) ──
        let y = paintKop('Uraian Progress', weekCount, reportDateLabel)

        const metaBoxH = drawMetaPanel(
            doc,
            MARGIN.left,
            y,
            contentWidth,
            [
                ['KEGIATAN', report.kegiatan?.nama_kegiatan || '-'],
                ['PEKERJAAN', report.pekerjaan.nama || '-'],
                ['LOKASI', lokasiText],
            ],
            [
                ['MINGGU KE', String(weekCount)],
                ['TANGGAL', weekRangeLabel],
            ],
        )

        const tableStartY = y + metaBoxH + 4

        // Build table headers
        const headers: PdfTable = [[]]
        headers[0] = [
            { content: 'NO', rowSpan: 2 },
            { content: 'URAIAN PEKERJAAN', rowSpan: 2 },
            { content: 'VOLUME SATUAN', rowSpan: 2 },
            { content: 'BOBOT', rowSpan: 2 },
            { content: 'PRESTASI S/D MINGGU LALU', colSpan: 3 },
            { content: 'PRESTASI MINGGU INI', colSpan: 3 },
            { content: 'PRESTASI S/D MINGGU INI', colSpan: 3 },
        ]
        const secondRow: string[] = []
        for (let i = 0; i < 3; i++) {
            secondRow.push('VOLUME', '%', 'BOBOT')
        }
        headers.push(secondRow)

        const body: PdfTable = []
        const groupedItems: Record<string, ProgressItemData[]> = {}
        report.items.forEach((item) => {
            const groupKey = item.nama_item || 'Lainnya'
            if (!groupedItems[groupKey]) groupedItems[groupKey] = []
            groupedItems[groupKey].push(item)
        })

        let rowNumber = 1
        const totalCols = 4 + 9

        Object.entries(groupedItems).forEach(([groupName, items]) => {
            body.push([
                {
                    content: groupName,
                    colSpan: totalCols,
                    styles: {
                        fontStyle: 'bold',
                        fillColor: COLORS.groupFill,
                        halign: 'left',
                        textColor: COLORS.primaryDark,
                    },
                },
            ])

            items.forEach((item) => {
                const row: PdfRow = [
                    rowNumber++,
                    item.rincian_item || '-',
                    formatSatuanLaluVolume(item.satuan, item.target_volume || 0),
                    Math.round(item.bobot || 0).toFixed(2),
                ]

                const weeklyData = item.weekly_data ?? {}
                const targetVol = item.target_volume || 0
                const bobot = item.bobot || 0

                let accumPrevWeek = 0
                for (let w = 1; w < weekCount; w++) {
                    accumPrevWeek += weekRealisasi(weeklyData, w)
                }
                const prevPercent = targetVol > 0 ? (accumPrevWeek / targetVol) * 100 : 0
                const prevBobot = (prevPercent * bobot) / 100
                row.push(
                    formatSatuanLaluVolume(item.satuan, accumPrevWeek),
                    Math.round(prevPercent).toFixed(2),
                    Math.round(prevBobot).toFixed(2),
                )

                const currentWeekReal = weekRealisasi(weeklyData, weekCount)
                const currentPercent = targetVol > 0 ? (currentWeekReal / targetVol) * 100 : 0
                const currentBobot = (currentPercent * bobot) / 100
                row.push(
                    formatSatuanLaluVolume(item.satuan, currentWeekReal),
                    Math.round(currentPercent).toFixed(2),
                    Math.round(currentBobot).toFixed(2),
                )

                const totalAccum = accumPrevWeek + currentWeekReal
                const totalPercent = targetVol > 0 ? (totalAccum / targetVol) * 100 : 0
                const totalBobot = (totalPercent * bobot) / 100
                row.push(
                    formatSatuanLaluVolume(item.satuan, totalAccum),
                    Math.round(totalPercent).toFixed(2),
                    Math.round(totalBobot).toFixed(2),
                )

                body.push(row)
            })
        })

        const totalRow: PdfRow = [
            '',
            { content: 'TOTAL', styles: { fontStyle: 'bold', fillColor: COLORS.totalFill } },
            { content: '', styles: { fillColor: COLORS.totalFill } },
            {
                content: Math.round(report.totals.total_bobot || 0).toFixed(2),
                styles: { fontStyle: 'bold', fillColor: COLORS.totalFill },
            },
        ]

        let totalPrevBobot = 0
        report.items.forEach((item) => {
            const weeklyData = item.weekly_data ?? {}
            let accumPrev = 0
            for (let w = 1; w < weekCount; w++) {
                accumPrev += weeklyData[w]?.realisasi ?? 0
            }
            const targetVol = item.target_volume || 0
            const prevPercent = targetVol > 0 ? (accumPrev / targetVol) * 100 : 0
            totalPrevBobot += (prevPercent * (item.bobot || 0)) / 100
        })
        totalRow.push(
            { content: '', styles: { fillColor: COLORS.totalFill } },
            { content: '', styles: { fillColor: COLORS.totalFill } },
            {
                content: Math.round(totalPrevBobot).toFixed(2),
                styles: { fontStyle: 'bold', fillColor: COLORS.totalFill },
            },
        )

        let totalCurrentBobot = 0
        report.items.forEach((item) => {
            const weeklyData = item.weekly_data ?? {}
            const currentReal = weeklyData[weekCount]?.realisasi ?? 0
            const targetVol = item.target_volume || 0
            const currentPercent = targetVol > 0 ? (currentReal / targetVol) * 100 : 0
            totalCurrentBobot += (currentPercent * (item.bobot || 0)) / 100
        })
        totalRow.push(
            { content: '', styles: { fillColor: COLORS.totalFill } },
            { content: '', styles: { fillColor: COLORS.totalFill } },
            {
                content: Math.round(totalCurrentBobot).toFixed(2),
                styles: { fontStyle: 'bold', fillColor: COLORS.totalFill },
            },
        )

        let page1GrandTotalBobot = 0
        report.items.forEach((item) => {
            const weeklyData = item.weekly_data ?? {}
            let totalAccum = 0
            for (let w = 1; w <= weekCount; w++) {
                totalAccum += weeklyData[w]?.realisasi ?? 0
            }
            const targetVol = item.target_volume || 0
            const totalPercent = targetVol > 0 ? (totalAccum / targetVol) * 100 : 0
            page1GrandTotalBobot += (totalPercent * (item.bobot || 0)) / 100
        })
        totalRow.push(
            { content: '', styles: { fillColor: COLORS.totalFill } },
            { content: '', styles: { fillColor: COLORS.totalFill } },
            {
                content: Math.round(page1GrandTotalBobot).toFixed(2),
                styles: { fontStyle: 'bold', fillColor: COLORS.totalFill },
            },
        )
        body.push(totalRow)

        autoTable(doc, {
            head: headers,
            body: body,
            startY: tableStartY,
            theme: 'grid',
            tableWidth: contentWidth,
            margin: {
                left: MARGIN.left,
                right: MARGIN.right,
                top: MARGIN.top,
                bottom: MARGIN.bottom,
            },
            styles: {
                fontSize: 6.5,
                cellPadding: 1.1,
                halign: 'center',
                valign: 'middle',
                overflow: 'linebreak',
                ...tableBodyStyles,
            },
            headStyles: tableHeadStyles,
            bodyStyles: tableBodyStyles,
            columnStyles: {
                0: { cellWidth: 8 },
                1: { cellWidth: 42, halign: 'left' },
                2: { cellWidth: 18 },
                3: { cellWidth: 12 },
            },
            didDrawPage: (data) => {
                if (data.pageNumber > 1) {
                    paintKop('Uraian Progress', weekCount, reportDateLabel, true)
                }
            },
        })

        // ── PAGE 2: REKAPITULASI ─────────────────────────────────────────
        doc.addPage('a4', 'landscape')
        y = paintKop('Rekapitulasi', weekCount, reportDateLabel)

        const rekapBoxH = drawMetaPanel(
            doc,
            MARGIN.left,
            y + 1,
            contentWidth,
            [
                ['Kegiatan', report.kegiatan?.nama_kegiatan || '-'],
                ['Sub Kegiatan', report.kegiatan?.nama_sub_kegiatan || '-'],
                ['Pekerjaan', report.pekerjaan.nama || '-'],
                ['Lokasi', lokasiText],
                [
                    'Tahun Anggaran',
                    String(report.kegiatan?.tahun_anggaran || new Date().getFullYear()),
                ],
                ['Kontraktor', report.penyedia?.nama || '-'],
            ],
            [
                ['No. SPMK', report.kontrak?.spmk || '-'],
                [
                    'Tanggal SPMK',
                    report.kontrak?.tgl_spmk
                        ? new Date(report.kontrak.tgl_spmk).toLocaleDateString('id-ID')
                        : '-',
                ],
                ['Minggu Ke', String(weekCount)],
                [
                    'Mulai',
                    report.kontrak?.tgl_spmk
                        ? new Date(report.kontrak.tgl_spmk).toLocaleDateString('id-ID')
                        : '-',
                ],
                [
                    'Selesai',
                    report.kontrak?.tgl_selesai
                        ? new Date(report.kontrak.tgl_selesai).toLocaleDateString('id-ID')
                        : '-',
                ],
                ['Waktu Laksana', `${waktuPelaksanaan} Hari Kalender`],
                ['Sisa Waktu', `${sisaWaktu} Hari Kalender`],
            ],
        )
        const currentY = y + 1 + rekapBoxH + 5

        let totalBobotMingguLalu = 0
        let totalBobotMingguIni = 0
        let totalBobotSampai = 0
        let totalRencanaSampai = 0

        const rekapHeaders = [
            [
                'NO',
                'URAIAN PEKERJAAN',
                'BOBOT (%)',
                'BOBOT MINGGU LALU (%)',
                'BOBOT MINGGU INI (%)',
                'BOBOT S/D MINGGU INI (%)',
            ],
        ]
        const rekapBody: PdfTable = []
        let rekapRowNum = 1
        const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']

        Object.entries(groupedItems).forEach(([groupName, items], groupIndex) => {
            let groupBobot = 0
            let groupBobotMingguLalu = 0
            let groupBobotMingguIni = 0
            let groupBobotSampai = 0

            items.forEach((item) => {
                const weeklyData = item.weekly_data ?? {}
                let accumLalu = 0
                for (let w = 1; w < weekCount; w++) {
                    accumLalu += weeklyData[w]?.realisasi ?? 0
                }
                const accumIni = weeklyData[weekCount]?.realisasi ?? 0
                const targetVol = item.target_volume || 0
                const bobot = item.bobot || 0
                const selesaiLalu = targetVol > 0 ? (accumLalu / targetVol) * 100 : 0
                const selesaiIni = targetVol > 0 ? (accumIni / targetVol) * 100 : 0
                const selesaiTotal = targetVol > 0 ? ((accumLalu + accumIni) / targetVol) * 100 : 0

                groupBobot += bobot
                groupBobotMingguLalu += (selesaiLalu * bobot) / 100
                groupBobotMingguIni += (selesaiIni * bobot) / 100
                groupBobotSampai += (selesaiTotal * bobot) / 100
                totalBobotMingguLalu += (selesaiLalu * bobot) / 100
                totalBobotMingguIni += (selesaiIni * bobot) / 100
                totalBobotSampai += (selesaiTotal * bobot) / 100
            })

            rekapBody.push([
                romanNumerals[groupIndex] || rekapRowNum,
                groupName,
                Math.round(groupBobot).toFixed(2),
                Math.round(groupBobotMingguLalu).toFixed(2),
                Math.round(groupBobotMingguIni).toFixed(2),
                Math.round(groupBobotSampai).toFixed(2),
            ])
            rekapRowNum++
        })

        rekapBody.push([
            '',
            { content: 'JUMLAH TOTAL', styles: { fontStyle: 'bold', fillColor: COLORS.totalFill } },
            {
                content: Math.round(report.totals.total_bobot || 0).toFixed(2),
                styles: { fontStyle: 'bold', fillColor: COLORS.totalFill },
            },
            {
                content: Math.round(totalBobotMingguLalu).toFixed(2),
                styles: { fontStyle: 'bold', fillColor: COLORS.totalFill },
            },
            {
                content: Math.round(totalBobotMingguIni).toFixed(2),
                styles: { fontStyle: 'bold', fillColor: COLORS.totalFill },
            },
            {
                content: Math.round(totalBobotSampai).toFixed(2),
                styles: { fontStyle: 'bold', fillColor: COLORS.totalFill },
            },
        ])

        report.items.forEach((item) => {
            const weeklyData = item.weekly_data ?? {}
            let rencanaSampai = 0
            for (let w = 1; w <= weekCount; w++) {
                rencanaSampai += weeklyData[w]?.rencana ?? 0
            }
            const targetVol = item.target_volume || 0
            const bobot = item.bobot || 0
            const rencanaPct = targetVol > 0 ? (rencanaSampai / targetVol) * 100 : 0
            totalRencanaSampai += (rencanaPct * bobot) / 100
        })

        const deviasi = totalBobotSampai - totalRencanaSampai

        autoTable(doc, {
            head: rekapHeaders,
            body: rekapBody,
            startY: currentY,
            theme: 'grid',
            tableWidth: contentWidth,
            margin: {
                left: MARGIN.left,
                right: MARGIN.right,
                top: MARGIN.top,
                bottom: MARGIN.bottom,
            },
            styles: {
                fontSize: 8,
                cellPadding: 1.5,
                halign: 'center',
                valign: 'middle',
                ...tableBodyStyles,
            },
            headStyles: { ...tableHeadStyles, fontSize: 7.5 },
            bodyStyles: tableBodyStyles,
            columnStyles: {
                0: { cellWidth: 12 },
                1: { cellWidth: 'auto', halign: 'left' },
                2: { cellWidth: 25 },
                3: { cellWidth: 32 },
                4: { cellWidth: 32 },
                5: { cellWidth: 36 },
            },
            didDrawPage: (data) => {
                if (data.pageNumber > 1) {
                    paintKop('Rekapitulasi', weekCount, reportDateLabel, true)
                }
            },
        })

        // Ringkasan prestasi
        let finalY = getAutoTableFinalY(doc) + 8
        const metrics = [
            ['PRESTASI REALISASI S/D MINGGU LALU', Math.round(totalBobotMingguLalu).toFixed(2)],
            ['PRESTASI REALISASI MINGGU INI', Math.round(totalBobotMingguIni).toFixed(2)],
            ['PRESTASI REALISASI S/D MINGGU INI', Math.round(totalBobotSampai).toFixed(2)],
            ['PRESTASI RENCANA S/D MINGGU INI', Math.round(totalRencanaSampai).toFixed(2)],
            ['DEVIASI S/D MINGGU INI', Math.round(deviasi).toFixed(2)],
        ]
        const metricsH = metrics.length * 5.5 + 4
        if (finalY + metricsH > pageHeight - MARGIN.bottom - 55) {
            doc.addPage('a4', 'landscape')
            finalY = paintKop('Ringkasan Prestasi', weekCount, reportDateLabel)
        }
        drawInfoBox(doc, MARGIN.left, finalY, contentWidth * 0.55, metricsH)
        doc.setFontSize(8)
        metrics.forEach(([label, value], idx) => {
            const my = finalY + 5 + idx * 5.5
            doc.setFont('helvetica', 'bold')
            doc.setTextColor(...COLORS.ink)
            doc.text(label, MARGIN.left + 3, my)
            doc.setTextColor(...COLORS.primaryDark)
            doc.text(`:  ${value}  %`, MARGIN.left + 105, my)
        })
        doc.setTextColor(...COLORS.ink)

        // ── Tanda tangan ────────────────────────────────────────────────
        let signatureStartY = finalY + metricsH + 12
        if (signatureStartY > pageHeight - 55) {
            doc.addPage('a4', 'landscape')
            signatureStartY = paintKop('Tanda Tangan', weekCount, reportDateLabel) + 4
        }

        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        const col1X = MARGIN.left + 8
        const col2X = pageWidth / 2 - 25
        const col3X = pageWidth - MARGIN.right - 70
        const nameY1 = signatureStartY + 35

        doc.setTextColor(...COLORS.muted)
        doc.text('Mengetahui :', col1X, signatureStartY)
        doc.setTextColor(...COLORS.ink)
        doc.text(signatureData.jabatanMengetahui, col1X, signatureStartY + 5)
        const instansiLines = doc.splitTextToSize(signatureData.instansiMengetahui, 60)
        instansiLines.forEach((line: string, idx: number) => {
            doc.text(line, col1X, signatureStartY + 9 + idx * 4)
        })
        doc.setFont('helvetica', 'bold')
        if (signatureData.namaMengetahui) {
            doc.text(signatureData.namaMengetahui.toUpperCase(), col1X, nameY1)
            doc.setDrawColor(...COLORS.primary)
            doc.setLineWidth(0.3)
            doc.line(col1X - 2, nameY1 + 1, col1X + 55, nameY1 + 1)
        }
        doc.setFont('helvetica', 'normal')
        if (signatureData.nipMengetahui) {
            doc.setTextColor(...COLORS.muted)
            doc.text(`NIP. ${signatureData.nipMengetahui}`, col1X, nameY1 + 5)
            doc.setTextColor(...COLORS.ink)
        }

        doc.setTextColor(...COLORS.muted)
        doc.text('Diperiksa :', col2X, signatureStartY)
        doc.setTextColor(...COLORS.ink)
        doc.text(signatureData.jabatanDiperiksa, col2X, signatureStartY + 5)
        doc.setFont('helvetica', 'bold')
        if (signatureData.namaDiperiksa) {
            doc.text(signatureData.namaDiperiksa.toUpperCase(), col2X, nameY1)
            doc.setDrawColor(...COLORS.primary)
            doc.line(col2X - 2, nameY1 + 1, col2X + 55, nameY1 + 1)
        }
        doc.setFont('helvetica', 'normal')
        if (signatureData.nipDiperiksa) {
            doc.setTextColor(...COLORS.muted)
            doc.text(`NIP. ${signatureData.nipDiperiksa}`, col2X, nameY1 + 5)
            doc.setTextColor(...COLORS.ink)
        }

        doc.setTextColor(...COLORS.primaryDark)
        doc.text(`${signatureData.lokasi},`, col3X, signatureStartY)
        doc.text(signatureData.tanggal, col3X + 28, signatureStartY)
        doc.setTextColor(...COLORS.muted)
        doc.text('Dibuat oleh :', col3X, signatureStartY + 5)
        doc.setTextColor(...COLORS.ink)
        if (signatureData.namaPerusahaan) {
            doc.setFont('helvetica', 'bold')
            doc.text(signatureData.namaPerusahaan, col3X, signatureStartY + 10)
            doc.setFont('helvetica', 'normal')
        }
        doc.setFont('helvetica', 'bold')
        if (signatureData.namaDirektur) {
            doc.text(signatureData.namaDirektur.toUpperCase(), col3X, nameY1)
            doc.setDrawColor(...COLORS.primary)
            doc.line(col3X - 2, nameY1 + 1, col3X + 55, nameY1 + 1)
        }
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(...COLORS.muted)
        doc.text('Direktur', col3X, nameY1 + 5)
        doc.setTextColor(...COLORS.ink)

        // ── PAGE 3: LAPORAN KEMAJUAN ─────────────────────────────────────
        doc.addPage('a4', 'landscape')
        y = paintKop('Laporan Kemajuan Pelaksanaan', weekCount, reportDateLabel)

        const boxW = contentWidth * 0.48
        drawInfoBox(doc, MARGIN.left, y, boxW, 26)
        drawInfoBox(doc, MARGIN.left + boxW + 4, y, contentWidth - boxW - 4, 26)

        doc.setFontSize(7.5)
        let p3Y = y + 5
        p3Y += drawMetaLine(
            doc,
            'SUB KEGIATAN',
            report.kegiatan?.nama_sub_kegiatan || '-',
            MARGIN.left + 2,
            MARGIN.left + 28,
            p3Y,
            boxW - 32,
        )
        p3Y += drawMetaLine(
            doc,
            'PEKERJAAN',
            report.pekerjaan.nama || '-',
            MARGIN.left + 2,
            MARGIN.left + 28,
            p3Y,
            boxW - 32,
        )
        drawMetaLine(doc, 'LOKASI', lokasiText, MARGIN.left + 2, MARGIN.left + 28, p3Y, boxW - 32)

        const rightBoxX = MARGIN.left + boxW + 6
        p3Y = y + 5
        p3Y += drawMetaLine(doc, 'Nomor', '600/BA.LPP......./……', rightBoxX, rightBoxX + 22, p3Y, 80)
        p3Y += drawMetaLine(doc, 'Minggu ke', String(weekCount), rightBoxX, rightBoxX + 22, p3Y, 80)
        drawMetaLine(
            doc,
            'Tanggal',
            weekRangeLabel,
            rightBoxX,
            rightBoxX + 22,
            p3Y,
            80,
        )

        let sectionY = y + 32
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(8)
        doc.setTextColor(...COLORS.primaryDark)
        doc.text('Telah Melaksanakan Pekerjaan Pelaksanaan Untuk :', MARGIN.left, sectionY)
        doc.setTextColor(...COLORS.ink)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(7.5)

        const infoStartY = sectionY + 6
        const labelX = MARGIN.left + 4
        const colonX = MARGIN.left + 52
        const valueX = MARGIN.left + 56

        const totalRABValue =
            Math.floor(
                report.items.reduce((sum: number, item) => {
                    return sum + (item.harga_satuan || 0) * (item.target_volume || 0) * 1.11
                }, 0) / 1000,
            ) * 1000

        const rows: Array<[string, string, string?]> = [
            ['a.', 'Pekerjaan', report.pekerjaan.nama || '-'],
            ['b.', 'Lokasi', lokasiText],
            [
                'c.',
                'Nomor DPA dan Tanggal',
                `Nomor: ${dpaData.nomorDpa || '-'}  ·  Tanggal: ${
                    dpaData.tanggalDpa
                        ? new Date(dpaData.tanggalDpa).toLocaleDateString('id-ID')
                        : '-'
                }`,
            ],
            ['d.', 'Kontraktor / Pelaksana', report.penyedia?.nama || '-'],
            [
                'e.',
                'Kontrak Nomor',
                `Nomor: ${report.kontrak?.spk || '-'}  ·  Tanggal: ${
                    report.kontrak?.tgl_spk
                        ? new Date(report.kontrak.tgl_spk).toLocaleDateString('id-ID')
                        : '-'
                }`,
            ],
            [
                'f.',
                'Harga Pelaksanaan',
                `Rp${new Intl.NumberFormat('id-ID').format(totalRABValue)}`,
            ],
            ['g.', 'Sumber Dana', report.kegiatan?.sumber_dana || 'APBD'],
            [
                'h.',
                'Waktu Pelaksanaan',
                `Mulai: ${
                    report.kontrak?.tgl_spmk
                        ? new Date(report.kontrak.tgl_spmk).toLocaleDateString('id-ID')
                        : '-'
                }  ·  Selesai: ${
                    report.kontrak?.tgl_selesai
                        ? new Date(report.kontrak.tgl_selesai).toLocaleDateString('id-ID')
                        : '-'
                }`,
            ],
        ]

        rows.forEach(([letter, label, value], idx) => {
            const ry = infoStartY + idx * 5
            doc.setFont('helvetica', 'bold')
            doc.setTextColor(...COLORS.muted)
            doc.text(letter, labelX, ry)
            doc.text(label, labelX + 5, ry)
            doc.setFont('helvetica', 'normal')
            doc.setTextColor(...COLORS.ink)
            doc.text(':', colonX, ry)
            doc.text(value || '-', valueX, ry, { maxWidth: contentWidth - 60 })
        })

        const kemajuanTableY = infoStartY + rows.length * 5 + 6
        const kemajuanHeaders = [
            [
                { content: 'NO', rowSpan: 2 },
                { content: 'URAIAN PEKERJAAN', rowSpan: 2 },
                { content: 'SATUAN VOLUME', rowSpan: 2 },
                { content: 'BOBOT', rowSpan: 2 },
                { content: 'REALISASI PELAKSANAAN', colSpan: 3 },
            ],
            ['VOLUME', 'PERSENTASE (%)', 'BOBOT HASIL (%)'],
        ]

        const kemajuanBody: PdfTable = []
        let kemajuanRowNum = 1
        let grandTotalBobotHasil = 0

        Object.entries(groupedItems).forEach(([groupName, items], groupIndex) => {
            kemajuanBody.push([
                {
                    content: romanNumerals[groupIndex] || groupIndex + 1,
                    styles: { fontStyle: 'bold', fillColor: COLORS.groupFill },
                },
                {
                    content: groupName,
                    colSpan: 6,
                    styles: {
                        fontStyle: 'bold',
                        halign: 'left',
                        fillColor: COLORS.groupFill,
                        textColor: COLORS.primaryDark,
                    },
                },
            ])

            let subTotalBobot = 0
            let subTotalBobotHasil = 0

            items.forEach((item) => {
                const weeklyData = item.weekly_data ?? {}
                let totalRealisasi = 0
                for (let w = 1; w <= weekCount; w++) {
                    totalRealisasi += weekRealisasi(weeklyData, w)
                }
                const targetVol = item.target_volume || 0
                const bobot = item.bobot || 0
                const prosentase = targetVol > 0 ? (totalRealisasi / targetVol) * 100 : 0
                const bobotHasil = (prosentase * bobot) / 100
                subTotalBobot += bobot
                subTotalBobotHasil += bobotHasil
                grandTotalBobotHasil += bobotHasil

                // SATUAN VOLUME = satuan saja; VOLUME = satuan dulu, baru angka realisasi
                kemajuanBody.push([
                    kemajuanRowNum++,
                    { content: item.rincian_item || '-', styles: { halign: 'left' } },
                    item.satuan || '-',
                    bobot.toFixed(2),
                    formatSatuanLaluVolume(item.satuan, totalRealisasi),
                    prosentase.toFixed(2),
                    bobotHasil.toFixed(2),
                ])
            })

            kemajuanBody.push([
                '',
                { content: 'SUB JUMLAH', styles: { fontStyle: 'bold', fillColor: COLORS.totalFill } },
                { content: '', styles: { fillColor: COLORS.totalFill } },
                {
                    content: subTotalBobot.toFixed(2),
                    styles: { fontStyle: 'bold', fillColor: COLORS.totalFill },
                },
                { content: '', styles: { fillColor: COLORS.totalFill } },
                { content: '', styles: { fillColor: COLORS.totalFill } },
                {
                    content: subTotalBobotHasil.toFixed(2),
                    styles: { fontStyle: 'bold', fillColor: COLORS.totalFill },
                },
            ])
        })

        kemajuanBody.push([
            '',
            {
                content: 'JUMLAH KEMAJUAN FISIK PEKERJAAN',
                styles: { fontStyle: 'bold', fillColor: COLORS.totalFill },
            },
            { content: '', styles: { fillColor: COLORS.totalFill } },
            {
                content: '100.00',
                styles: { fontStyle: 'bold', fillColor: COLORS.totalFill },
            },
            { content: '', styles: { fillColor: COLORS.totalFill } },
            { content: '', styles: { fillColor: COLORS.totalFill } },
            {
                content: grandTotalBobotHasil.toFixed(2),
                styles: { fontStyle: 'bold', fillColor: COLORS.totalFill },
            },
        ])

        autoTable(doc, {
            head: kemajuanHeaders,
            body: kemajuanBody,
            startY: kemajuanTableY,
            theme: 'grid',
            tableWidth: contentWidth,
            margin: {
                left: MARGIN.left,
                right: MARGIN.right,
                top: MARGIN.top,
                bottom: MARGIN.bottom,
            },
            styles: {
                fontSize: 7,
                cellPadding: 1.1,
                halign: 'center',
                valign: 'middle',
                ...tableBodyStyles,
            },
            headStyles: tableHeadStyles,
            bodyStyles: tableBodyStyles,
            columnStyles: {
                0: { cellWidth: 10 },
                1: { cellWidth: 'auto',halign: 'left' },
                2: { cellWidth: 25 },
                3: { cellWidth: 20 },
                4: { cellWidth: 25 },
                5: { cellWidth: 25 },
                6: { cellWidth: 25 },
            },
            didDrawPage: (data) => {
                if (data.pageNumber > 1) {
                    paintKop(
                        'Laporan Kemajuan Pelaksanaan',
                        weekCount,
                        reportDateLabel,
                        true,
                    )
                }
            },
        })

        let sigY3 = getAutoTableFinalY(doc) + 12
        if (sigY3 > pageHeight - 55) {
            doc.addPage('a4', 'landscape')
            sigY3 = paintKop('Tanda Tangan', weekCount, reportDateLabel) + 4
        }

        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        const p3col1X = MARGIN.left + 8
        const p3col2X = pageWidth / 2 - 25
        const p3col3X = pageWidth - MARGIN.right - 70
        const nameY3 = sigY3 + 35

        doc.setTextColor(...COLORS.muted)
        doc.text('Mengetahui :', p3col1X, sigY3)
        doc.setTextColor(...COLORS.ink)
        doc.text(signatureData.jabatanMengetahui, p3col1X, sigY3 + 5)
        const instansiLines3 = doc.splitTextToSize(signatureData.instansiMengetahui, 60)
        instansiLines3.forEach((line: string, idx: number) => {
            doc.text(line, p3col1X, sigY3 + 9 + idx * 4)
        })
        doc.setFont('helvetica', 'bold')
        if (signatureData.namaMengetahui) {
            doc.text(signatureData.namaMengetahui.toUpperCase(), p3col1X, nameY3)
            doc.setDrawColor(...COLORS.primary)
            doc.line(p3col1X - 2, nameY3 + 1, p3col1X + 55, nameY3 + 1)
        }
        doc.setFont('helvetica', 'normal')
        if (signatureData.nipMengetahui) {
            doc.setTextColor(...COLORS.muted)
            doc.text(`NIP. ${signatureData.nipMengetahui}`, p3col1X, nameY3 + 5)
            doc.setTextColor(...COLORS.ink)
        }

        doc.setTextColor(...COLORS.muted)
        doc.text('Diperiksa :', p3col2X, sigY3)
        doc.setTextColor(...COLORS.ink)
        doc.text(signatureData.jabatanDiperiksa, p3col2X, sigY3 + 5)
        doc.setFont('helvetica', 'bold')
        if (signatureData.namaDiperiksa) {
            doc.text(signatureData.namaDiperiksa.toUpperCase(), p3col2X, nameY3)
            doc.setDrawColor(...COLORS.primary)
            doc.line(p3col2X - 2, nameY3 + 1, p3col2X + 55, nameY3 + 1)
        }
        doc.setFont('helvetica', 'normal')
        if (signatureData.nipDiperiksa) {
            doc.setTextColor(...COLORS.muted)
            doc.text(`NIP. ${signatureData.nipDiperiksa}`, p3col2X, nameY3 + 5)
            doc.setTextColor(...COLORS.ink)
        }

        doc.setTextColor(...COLORS.primaryDark)
        doc.text(`${signatureData.lokasi},`, p3col3X, sigY3)
        doc.text(signatureData.tanggal, p3col3X + 28, sigY3)
        doc.setTextColor(...COLORS.muted)
        doc.text('Dibuat oleh :', p3col3X, sigY3 + 5)
        doc.setTextColor(...COLORS.ink)
        if (signatureData.namaPerusahaan) {
            doc.setFont('helvetica', 'bold')
            doc.text(signatureData.namaPerusahaan, p3col3X, sigY3 + 10)
            doc.setFont('helvetica', 'normal')
        }
        doc.setFont('helvetica', 'bold')
        if (signatureData.namaDirektur) {
            doc.text(signatureData.namaDirektur.toUpperCase(), p3col3X, nameY3)
            doc.setDrawColor(...COLORS.primary)
            doc.line(p3col3X - 2, nameY3 + 1, p3col3X + 55, nameY3 + 1)
        }
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(...COLORS.muted)
        doc.text('Direktur', p3col3X, nameY3 + 5)
        doc.setTextColor(...COLORS.ink)
    }

    weeksToRender.forEach((currentWeek) => {
        renderWeek(currentWeek)
    })

    drawPageFooter()

    const safeName =
        fileName ||
        `Laporan_Mingguan_${(report.pekerjaan.nama || 'progress').replace(/\s+/g, '_')}.pdf`
    const finalName = safeName.endsWith('.pdf') ? safeName : `${safeName}.pdf`
    doc.save(finalName)
}
