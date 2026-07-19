import type jsPDF from 'jspdf'

/** Tinggi area kop (mm) di atas tabel — landscape A4 (logo + instansi + judul + meta). */
export const PDF_REPORT_HEADER_MM = 42
/** Tinggi area footer (mm). */
export const PDF_REPORT_FOOTER_MM = 12

const LOGO_CIANJUR_PATH = '/logo-cianjurkab.png'
const LOGO_AMS_PATH = '/logo-ams.png'
const LOGO_ARUMANIS_PATH = '/logo-arumanis.png'

export type ReportPdfLogos = {
    cianjurDataUrl: string | null
    amsDataUrl: string | null
    arumanisDataUrl: string | null
}

export type ReportPdfLogoVisibility = {
    /** Logo Bidang Air Minum dan Sanitasi (kanan). Default: false */
    showAms?: boolean
    /** Logo Arumanis (kanan). Default: false */
    showArumanis?: boolean
    /** Lambang Cianjurkab (kiri). Default: true */
    showCianjur?: boolean
}

export type ReportPdfHeaderOptions = {
    logos: ReportPdfLogos
    /** Judul dokumen, mis. DAFTAR PEKERJAAN */
    title: string
    /** Baris meta di bawah judul (tahun, tanggal, filter) */
    metaLine?: string
    /** Sub-judul opsional (sub kegiatan) */
    subtitle?: string
    marginLeft: number
    marginRight: number
    /** Logo opsional di kop — AMS & Arumanis default tidak tampil */
    logoVisibility?: ReportPdfLogoVisibility
}

/** Muat hanya logo yang diminta (hemat fetch). */
export async function loadReportPdfLogosSelective(
    visibility: ReportPdfLogoVisibility = {},
): Promise<ReportPdfLogos> {
    const showCianjur = visibility.showCianjur !== false
    const showAms = visibility.showAms === true
    const showArumanis = visibility.showArumanis === true

    const [cianjurDataUrl, amsDataUrl, arumanisDataUrl] = await Promise.all([
        showCianjur ? fetchAsDataUrl(LOGO_CIANJUR_PATH) : Promise.resolve(null),
        showAms ? fetchAsDataUrl(LOGO_AMS_PATH) : Promise.resolve(null),
        showArumanis ? fetchAsDataUrl(LOGO_ARUMANIS_PATH) : Promise.resolve(null),
    ])
    return { cianjurDataUrl, amsDataUrl, arumanisDataUrl }
}

async function fetchAsDataUrl(path: string): Promise<string | null> {
    try {
        const res = await fetch(path)
        if (!res.ok) return null
        const blob = await res.blob()
        return await new Promise<string | null>((resolve) => {
            const reader = new FileReader()
            reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : null)
            reader.onerror = () => resolve(null)
            reader.readAsDataURL(blob)
        })
    } catch {
        return null
    }
}

/** Muat semua logo (kompatibilitas). Prefer loadReportPdfLogosSelective. */
export async function loadReportPdfLogos(): Promise<ReportPdfLogos> {
    return loadReportPdfLogosSelective({
        showCianjur: true,
        showAms: true,
        showArumanis: true,
    })
}

function safeAddImage(
    doc: jsPDF,
    dataUrl: string | null,
    format: 'PNG' | 'JPEG',
    x: number,
    y: number,
    w: number,
    h: number,
) {
    if (!dataUrl) return
    try {
        doc.addImage(dataUrl, format, x, y, w, h, undefined, 'FAST')
    } catch {
        // skip broken image — text header tetap tampil
    }
}

/**
 * Kop laporan profesional:
 * logo Cianjur (opsional) | instansi | logo AMS / Arumanis (opsional)
 * + garis + judul dokumen
 *
 * Default: Cianjur tampil; AMS & Arumanis tidak tampil.
 */
export function drawReportPdfHeader(doc: jsPDF, options: ReportPdfHeaderOptions): number {
    const pageW = doc.internal.pageSize.getWidth()
    const left = options.marginLeft
    const right = pageW - options.marginRight
    const centerX = pageW / 2
    const contentW = right - left

    const showCianjur = options.logoVisibility?.showCianjur !== false
    const showAms = options.logoVisibility?.showAms === true
    const showArumanis = options.logoVisibility?.showArumanis === true

    /** Tinggi seragam untuk logo. */
    const logoH = 16
    /** Arumanis square; AMS landscape (ikon + wordmark) — tinggi sama, lebar proporsional. */
    const arumanisW = logoH
    const amsW = logoH * 1.71
    const logoGap = 2.5
    const topY = 5
    /** Jarak vertikal antara bawah logo dan garis pemisah (mm). */
    const gapAfterLogo = 4

    // Logo kiri — Lambang Kabupaten Cianjur
    if (showCianjur) {
        safeAddImage(doc, options.logos.cianjurDataUrl, 'PNG', left, topY, logoH, logoH)
    }

    // Logo kanan — dari ujung kanan ke kiri: Arumanis, lalu AMS
    let cursorRight = right
    if (showArumanis) {
        const x = cursorRight - arumanisW
        safeAddImage(doc, options.logos.arumanisDataUrl, 'PNG', x, topY, arumanisW, logoH)
        cursorRight = x - logoGap
    }
    if (showAms) {
        const x = cursorRight - amsW
        safeAddImage(doc, options.logos.amsDataUrl, 'PNG', x, topY, amsW, logoH)
        cursorRight = x - logoGap
    }

    const leftLogoW = showCianjur ? logoH : 0
    const rightLogosWidth = Math.max(0, right - cursorRight - logoGap)
    const textMaxW = Math.max(100, contentW - leftLogoW - rightLogosWidth - 12)
    let ty = topY + 4

    doc.setTextColor(15, 23, 42)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.text('PEMERINTAH KABUPATEN CIANJUR', centerX, ty, {
        align: 'center',
        maxWidth: textMaxW,
    })
    ty += 4

    doc.setFontSize(8.5)
    doc.text('DINAS PERUMAHAN DAN KAWASAN PERMUKIMAN', centerX, ty, {
        align: 'center',
        maxWidth: textMaxW,
    })
    ty += 4

    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(30, 64, 175)
    doc.text('Bidang Air Minum dan Sanitasi', centerX, ty, {
        align: 'center',
        maxWidth: textMaxW,
    })

    // Garis di bawah logo (bukan menempel ke logo / teks)
    const logoBottom = topY + logoH
    ty = Math.max(ty, logoBottom) + gapAfterLogo

    doc.setDrawColor(37, 99, 235)
    doc.setLineWidth(0.45)
    doc.line(left, ty, right, ty)
    doc.setDrawColor(148, 163, 184)
    doc.setLineWidth(0.2)
    doc.line(left, ty + 0.9, right, ty + 0.9)
    ty += 5.5

    // Judul dokumen
    doc.setTextColor(15, 23, 42)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text(options.title, centerX, ty, { align: 'center', maxWidth: contentW })
    ty += 4.5

    if (options.subtitle) {
        doc.setFontSize(9)
        doc.setFont('helvetica', 'bold')
        const wrapped = doc.splitTextToSize(options.subtitle, contentW)
        doc.text(wrapped, centerX, ty, { align: 'center' })
        ty += Math.max(4, wrapped.length * 3.8)
    }

    if (options.metaLine) {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
        doc.setTextColor(71, 85, 105)
        const wrappedMeta = doc.splitTextToSize(options.metaLine, contentW)
        doc.text(wrappedMeta, centerX, ty, { align: 'center' })
        ty += Math.max(3.5, wrappedMeta.length * 3.4)
    }

    doc.setTextColor(0)
    return Math.max(ty + 2, PDF_REPORT_HEADER_MM)
}

/**
 * Footer profesional setiap halaman.
 */
export function drawReportPdfFooter(
    doc: jsPDF,
    options: {
        pageNumber: number
        totalPages?: number
        marginLeft: number
        marginRight: number
        printedAt?: string
    },
) {
    const pageW = doc.internal.pageSize.getWidth()
    const pageH = doc.internal.pageSize.getHeight()
    const left = options.marginLeft
    const right = pageW - options.marginRight
    const yLine = pageH - 10
    const yText = pageH - 6

    doc.setDrawColor(37, 99, 235)
    doc.setLineWidth(0.35)
    doc.line(left, yLine, right, yLine)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(71, 85, 105)

    const leftLabel = 'Bidang Air Minum dan Sanitasi · Disperkim Cianjur · Arumanis'
    doc.text(leftLabel, left, yText)

    const pageLabel =
        options.totalPages != null
            ? `Halaman ${options.pageNumber} / ${options.totalPages}`
            : `Halaman ${options.pageNumber}`
    doc.text(pageLabel, right, yText, { align: 'right' })

    if (options.printedAt) {
        doc.setFontSize(6.5)
        doc.text(options.printedAt, (left + right) / 2, yText, { align: 'center' })
    }

    doc.setTextColor(0)
}
