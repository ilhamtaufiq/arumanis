import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import {
    drawReportPdfFooter,
    drawReportPdfHeader,
    loadReportPdfLogosSelective,
    PDF_REPORT_FOOTER_MM,
    PDF_REPORT_HEADER_MM,
    type ReportPdfLogoVisibility,
    type ReportPdfLogos,
} from '@/features/pekerjaan/lib/export-pdf-branding'
import type { PuspenProgressFisikItem } from '../api/progress-fisik'
import type { PuspenUncontractedPekerjaan } from '../api/progress-fisik'
import {
    buildSubKegiatanRekap,
    DEFAULT_EXPORT_FINANCIAL_COLUMNS,
    financialColumnWidths,
    financialFormattedCells,
    financialHeaderLabels,
    flattenGroupedItems,
    formatCurrencyId,
    formatDateId,
    formatNumberId,
    formatUpdatedAt,
    phoLabel,
    prepareItemsForExportWithUncontracted,
    type ExportOptions,
} from './export-shared'

/** Margin kertas A4 landscape — selaras export pekerjaan */
const MARGIN = {
    left: 12,
    right: 12,
    top: PDF_REPORT_HEADER_MM,
    bottom: PDF_REPORT_FOOTER_MM + 2,
} as const

const PDF_TITLE = 'LAPORAN PROGRESS FISIK'

type ExportPdfParams = {
    items: PuspenProgressFisikItem[]
    tahun: number
    options: ExportOptions
    /** Paket belum berkontrak (tampil di detail + halaman rekap khusus) */
    uncontractedPekerjaan?: PuspenUncontractedPekerjaan[]
    title?: string
}

/** Skala lebar kolom agar total = contentWidth (center di halaman) */
function scaleColumnWidths(
    widths: number[],
    contentWidth: number,
): Record<number, { cellWidth: number; halign?: 'left' | 'center' | 'right' }> {
    const sum = widths.reduce((a, b) => a + b, 0) || 1
    const scale = contentWidth / sum
    const result: Record<number, { cellWidth: number; halign?: 'left' | 'center' | 'right' }> = {}
    widths.forEach((w, i) => {
        result[i] = { cellWidth: Math.round(w * scale * 100) / 100 }
    })
    return result
}

function paintHeader(
    doc: jsPDF,
    logos: ReportPdfLogos,
    logoVisibility: ReportPdfLogoVisibility,
    subtitle: string,
    metaLine: string,
    title = PDF_TITLE,
) {
    return drawReportPdfHeader(doc, {
        logos,
        title,
        subtitle,
        metaLine,
        marginLeft: MARGIN.left,
        marginRight: MARGIN.right,
        logoVisibility,
    })
}

export async function exportProgressFisikPdf({
    items,
    tahun,
    options,
    uncontractedPekerjaan = [],
    title = PDF_TITLE,
}: ExportPdfParams) {
    // Snapshot per periode + gabung paket belum berkontrak, lalu filter sub
    const { groups, uncontractedFiltered } = prepareItemsForExportWithUncontracted(
        items,
        uncontractedPekerjaan,
        tahun,
        options,
    )
    const filteredItems = flattenGroupedItems(groups)
    if (!filteredItems.length && uncontractedFiltered.length === 0) return

    const { period } = options
    const fin = options.financialColumns ?? DEFAULT_EXPORT_FINANCIAL_COLUMNS
    const finHeaders = financialHeaderLabels(fin, 'short')
    const finCount = finHeaders.length

    const logoVisibility: ReportPdfLogoVisibility = {
        showCianjur: true,
        showAms: options.pdfShowLogoAms === true,
        showArumanis: options.pdfShowLogoArumanis === true,
    }
    const logos = await loadReportPdfLogosSelective(logoVisibility)

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
    const pageWidth = doc.internal.pageSize.getWidth()
    const contentWidth = pageWidth - MARGIN.left - MARGIN.right
    const centerX = pageWidth / 2
    const now = new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'long',
        timeStyle: 'short',
    }).format(new Date())

    const metaLine = [
        `Tahun Anggaran: ${tahun}`,
        `Periode: ${formatDateId(period.startDate)} s/d ${formatDateId(period.endDate)}`,
        `Dicetak: ${now}`,
    ].join('  ·  ')

    const tableMargin = {
        top: MARGIN.top,
        right: MARGIN.right,
        bottom: MARGIN.bottom,
        left: MARGIN.left,
    }

    const headerForPage = (subtitle: string) =>
        paintHeader(doc, logos, logoVisibility, subtitle, metaLine, title)

    // ── Halaman 1: Rekap (kop digambar di didDrawPage) ────────────────────
    const rekapSubtitle = `Rekap Progress Fisik per Sub Kegiatan — Tahun ${tahun}`
    let startY = MARGIN.top

    const rekap = buildSubKegiatanRekap(filteredItems)
    const rekapOrder = new Map(options.subKegiatan.map((name, i) => [name, i]))
    rekap.sort(
        (a, b) =>
            (rekapOrder.get(a.subKegiatan) ?? 999) - (rekapOrder.get(b.subKegiatan) ?? 999),
    )

    const rekapBody = rekap.map((row, index) => [
        String(index + 1),
        row.subKegiatan,
        String(row.count),
        formatNumberId(row.rencana),
        formatNumberId(row.realisasi),
        formatNumberId(row.deviasi),
        ...financialFormattedCells(fin, row),
        `${row.phoSudah} / ${row.phoBelum}`,
    ])

    const totalPagu = rekap.reduce((s, r) => s + r.pagu, 0)
    const totalNilai = rekap.reduce((s, r) => s + r.nilaiKontrak, 0)
    const totalSisa = rekap.reduce((s, r) => s + r.sisaKontrak, 0)
    const totalRetensi = rekap.reduce((s, r) => s + r.retensi, 0)
    const totalPaket = rekap.reduce((s, r) => s + r.count, 0)
    const avgRencana =
        totalPaket > 0 ? rekap.reduce((s, r) => s + r.rencana * r.count, 0) / totalPaket : 0
    const avgRealisasi =
        totalPaket > 0 ? rekap.reduce((s, r) => s + r.realisasi * r.count, 0) / totalPaket : 0

    rekapBody.push([
        '',
        'TOTAL / RATA-RATA',
        String(totalPaket),
        formatNumberId(avgRencana),
        formatNumberId(avgRealisasi),
        formatNumberId(avgRealisasi - avgRencana),
        ...financialFormattedCells(fin, {
            pagu: totalPagu,
            nilaiKontrak: totalNilai,
            sisaKontrak: totalSisa,
            retensi: totalRetensi,
        }),
        '',
    ])

    const rekapColStyles = scaleColumnWidths(
        [8, 48, 12, 16, 18, 16, ...financialColumnWidths(fin, 26), 22],
        contentWidth,
    )
    rekapColStyles[1] = { ...rekapColStyles[1], halign: 'left' }
    for (let i = 0; i < finCount; i++) {
        rekapColStyles[6 + i] = { ...rekapColStyles[6 + i], halign: 'right' }
    }

    autoTable(doc, {
        head: [[
            'No',
            'Sub Kegiatan',
            'Paket',
            'Rencana (%)',
            'Realisasi (%)',
            'Deviasi (%)',
            ...finHeaders,
            'PHO (Sudah/Belum)',
        ]],
        body: rekapBody,
        startY,
        theme: 'grid',
        margin: tableMargin,
        tableWidth: contentWidth,
        styles: {
            fontSize: 7,
            cellPadding: 1.5,
            halign: 'center',
            valign: 'middle',
            overflow: 'linebreak',
        },
        headStyles: {
            fillColor: [37, 99, 235],
            textColor: 255,
            fontStyle: 'bold',
            lineWidth: 0.1,
            lineColor: [203, 213, 225],
            halign: 'center',
        },
        bodyStyles: {
            lineWidth: 0.1,
            lineColor: [203, 213, 225],
        },
        columnStyles: rekapColStyles,
        didParseCell: (data) => {
            if (data.section === 'body' && data.row.index === rekapBody.length - 1) {
                data.cell.styles.fontStyle = 'bold'
                data.cell.styles.fillColor = [239, 246, 255]
            }
        },
        didDrawPage: () => {
            headerForPage(rekapSubtitle)
        },
    })

    // Catatan di bawah tabel rekap (bukan footer halaman)
    const afterRekap =
        (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? startY
    doc.setFontSize(7)
    doc.setFont('helvetica', 'italic')
    doc.setTextColor(71, 85, 105)
    const noteParts = [
        fin.sisaKontrak ? 'Sisa Kontrak = Pagu − Nilai Kontrak' : null,
        fin.retensi ? 'Retensi = 5% × Nilai Kontrak' : null,
        `Detail disusun per sub kegiatan (${groups.length} bagian)`,
        uncontractedFiltered.length > 0
            ? `${uncontractedFiltered.length} paket aktif belum berkontrak (halaman berikutnya)`
            : 'Tidak ada paket aktif belum berkontrak',
        'Paket dibatalkan dikecualikan dari daftar belum berkontrak',
        'Progres: status s.d. tanggal akhir periode (belum diupdate = 0% / Belum PHO)',
    ].filter(Boolean)
    doc.text(`Catatan: ${noteParts.join('. ')}.`, centerX, afterRekap + 6, {
        align: 'center',
        maxWidth: contentWidth,
    })
    doc.setTextColor(0)

    // ── Halaman 2: Rekap paket belum berkontrak ───────────────────────────
    doc.addPage('a4', 'landscape')
    const uncSubtitle = `Rekap Paket Belum Berkontrak (aktif) — Tahun ${tahun} (${uncontractedFiltered.length} paket)`
    startY = MARGIN.top

    if (uncontractedFiltered.length === 0) {
        headerForPage(uncSubtitle)
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.text(
            'Tidak ada paket pekerjaan aktif yang belum berkontrak pada filter/sub kegiatan ini.',
            centerX,
            startY + 10,
            { align: 'center', maxWidth: contentWidth },
        )
        doc.setFontSize(8)
        doc.setTextColor(71, 85, 105)
        doc.text(
            'Catatan: paket berstatus dibatalkan tidak ditampilkan di daftar ini.',
            centerX,
            startY + 18,
            { align: 'center', maxWidth: contentWidth },
        )
        doc.setTextColor(0)
    } else {
        const uncBody = uncontractedFiltered.map((row, index) => [
            String(index + 1),
            row.namaPaket || '-',
            row.kodeRekening || '-',
            row.subKegiatan || 'Tanpa Sub Kegiatan',
            row.kecamatan || '-',
            row.desa || '-',
            formatCurrencyId(row.pagu),
            'Belum berkontrak',
        ])

        const totalPaguUnc = uncontractedFiltered.reduce((s, r) => s + (r.pagu ?? 0), 0)
        uncBody.push([
            '',
            'TOTAL',
            '',
            String(uncontractedFiltered.length) + ' paket',
            '',
            '',
            formatCurrencyId(totalPaguUnc),
            '',
        ])

        const uncColStyles = scaleColumnWidths(
            [8, 55, 22, 40, 28, 28, 30, 28],
            contentWidth,
        )
        uncColStyles[1] = { ...uncColStyles[1], halign: 'left' }
        uncColStyles[3] = { ...uncColStyles[3], halign: 'left' }
        uncColStyles[6] = { ...uncColStyles[6], halign: 'right' }

        autoTable(doc, {
            head: [[
                'No',
                'Nama Paket',
                'Kode Rekening',
                'Sub Kegiatan',
                'Kecamatan',
                'Desa',
                'Pagu',
                'Status',
            ]],
            body: uncBody,
            startY,
            theme: 'grid',
            margin: tableMargin,
            tableWidth: contentWidth,
            styles: {
                fontSize: 7,
                cellPadding: 1.5,
                halign: 'center',
                valign: 'middle',
                overflow: 'linebreak',
            },
            headStyles: {
                fillColor: [220, 38, 38],
                textColor: 255,
                fontStyle: 'bold',
                lineWidth: 0.1,
                lineColor: [0, 0, 0],
                halign: 'center',
            },
            bodyStyles: {
                lineWidth: 0.1,
                lineColor: [203, 213, 225],
            },
            columnStyles: uncColStyles,
            didParseCell: (data) => {
                if (data.section === 'body' && data.row.index === uncBody.length - 1) {
                    data.cell.styles.fontStyle = 'bold'
                    data.cell.styles.fillColor = [254, 242, 242]
                }
            },
            didDrawPage: () => {
                headerForPage(uncSubtitle)
            },
        })
    }

    // ── Detail per sub kegiatan (termasuk baris belum berkontrak) ─────────
    const detailHead = [[
        'No',
        'Paket',
        'Status',
        'Rencana (%)',
        'Realisasi (%)',
        'Deviasi (%)',
        ...finHeaders,
        'PHO',
        'Update',
    ]]

    const detailColStyles = scaleColumnWidths(
        [8, 48, 22, 14, 14, 12, ...financialColumnWidths(fin, 24), 12, 22],
        contentWidth,
    )
    detailColStyles[1] = { ...detailColStyles[1],halign: 'left' }
    for (let i = 0; i < finCount; i++) {
        detailColStyles[6 + i] = { ...detailColStyles[6 + i],halign: 'right' }
    }

    groups.forEach((group, groupIndex) => {
        doc.addPage('a4', 'landscape')
        const detailSubtitle = `Detail: ${group.subKegiatan} (${groupIndex + 1}/${groups.length}) — Tahun ${tahun}`
        // Summary line di bawah kop; tabel mulai sedikit di bawah MARGIN.top
        startY = MARGIN.top + 1

        const body = group.items.map((item, index) => [
            String(index + 1),
            item.namaPaket || '-',
            item.isUncontracted ? 'Belum berkontrak' : 'Berkontrak',
            item.rencana !== null ? formatNumberId(item.rencana) : '-',
            item.realisasi !== null ? formatNumberId(item.realisasi) : '-',
            item.deviasi !== null ? formatNumberId(item.deviasi) : '-',
            ...financialFormattedCells(fin, {
                pagu: item.pagu ?? 0,
                nilaiKontrak: item.nilaiKontrak ?? 0,
                sisaKontrak: item.sisaKontrak ?? 0,
                retensi: item.retensi ?? 0,
            }),
            item.isUncontracted ? '-' : phoLabel(item.phoCompleted),
            item.isUncontracted ? '-' : formatUpdatedAt(item.updatedAt),
        ])

        const gRekap = buildSubKegiatanRekap(group.items)[0]
        // Header first (no autoTable yet), then optional summary under kop
        headerForPage(detailSubtitle)
        if (gRekap) {
            doc.setFontSize(8)
            doc.setFont('helvetica', 'normal')
            doc.setTextColor(71, 85, 105)
            const summaryBits = [
                `${gRekap.count} paket`,
                `Rencana ${formatNumberId(gRekap.rencana)}%`,
                `Realisasi ${formatNumberId(gRekap.realisasi)}%`,
            ]
            if (fin.pagu) summaryBits.push(`Pagu ${formatCurrencyId(gRekap.pagu)}`)
            if (fin.nilaiKontrak) summaryBits.push(`Nilai ${formatCurrencyId(gRekap.nilaiKontrak)}`)
            doc.text(summaryBits.join(' · '), centerX, startY, {
                align: 'center',
                maxWidth: contentWidth,
            })
            startY += 5
            doc.setTextColor(0)
        }

        autoTable(doc, {
            head: detailHead,
            body,
            startY,
            theme: 'grid',
            margin: tableMargin,
            tableWidth: contentWidth,
            styles: {
                fontSize: 6.5,
                cellPadding: 1.2,
                halign: 'center',
                valign: 'middle',
                overflow: 'linebreak',
            },
            headStyles: {
                fillColor: [37, 99, 235],
                textColor: 255,
                fontStyle: 'bold',
                lineWidth: 0.1,
                lineColor: [203, 213, 225],
                halign: 'center',
            },
            bodyStyles: {
                lineWidth: 0.1,
                lineColor: [203, 213, 225],
            },
            columnStyles: detailColStyles,
            didDrawPage: (data) => {
                // Page 1 already has header from above; redraw on continuation pages
                if (data.pageNumber > 1) {
                    headerForPage(detailSubtitle)
                }
            },
        })
    })

    // Footer profesional di semua halaman
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        drawReportPdfFooter(doc, {
            pageNumber: i,
            totalPages: pageCount,
            marginLeft: MARGIN.left,
            marginRight: MARGIN.right,
        })
    }

    const pdfBlob = doc.output('bloburl')
    window.open(pdfBlob, '_blank')
}
