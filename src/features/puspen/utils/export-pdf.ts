import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
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
    PROGRESS_FISIK_EXPORT_TITLE,
    type ExportOptions,
} from './export-shared'

/** Margin kertas A4 (mm) — kiri/kanan/atas/bawah seimbang */
const MARGIN = {
    left: 14,
    right: 14,
    top: 12,
    bottom: 12,
} as const

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

export function exportProgressFisikPdf({
    items,
    tahun,
    options,
    uncontractedPekerjaan = [],
    title = PROGRESS_FISIK_EXPORT_TITLE,
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

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const contentWidth = pageWidth - MARGIN.left - MARGIN.right
    const centerX = pageWidth / 2
    const now = new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'long',
        timeStyle: 'short',
    }).format(new Date())

    const tableMargin = { left: MARGIN.left, right: MARGIN.right }

    const drawHeader = (subtitle: string) => {
        let y = MARGIN.top + 2

        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.text(title, centerX, y, { align: 'center', maxWidth: contentWidth })
        y += 6

        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        doc.text(subtitle, centerX, y, { align: 'center', maxWidth: contentWidth })
        y += 5

        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        doc.text(
            `Periode laporan: ${formatDateId(period.startDate)} s/d ${formatDateId(period.endDate)}`,
            centerX,
            y,
            { align: 'center' },
        )
        y += 4
        doc.text(
            'Data progres: status s.d. tanggal akhir periode (belum diupdate = 0% / Belum PHO)',
            centerX,
            y,
            { align: 'center', maxWidth: contentWidth },
        )
        y += 4
        doc.text(`Dicetak: ${now}`, centerX, y, { align: 'center' })

        return y + 4
    }

    // ── Halaman 1: Rekap ──────────────────────────────────────────────────
    let startY = drawHeader(`Rekap Progress Fisik per Sub Kegiatan — Tahun ${tahun}`)

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
            fillColor: [251, 133, 0],
            textColor: [0, 0, 0],
            fontStyle: 'bold',
            lineWidth: 0.1,
            lineColor: [0, 0, 0],
            halign: 'center',
        },
        bodyStyles: {
            lineWidth: 0.1,
            lineColor: [0, 0, 0],
        },
        columnStyles: rekapColStyles,
        didParseCell: (data) => {
            if (data.section === 'body' && data.row.index === rekapBody.length - 1) {
                data.cell.styles.fontStyle = 'bold'
                data.cell.styles.fillColor = [255, 247, 232]
            }
        },
    })

    doc.setFontSize(7)
    doc.setFont('helvetica', 'italic')
    const noteParts = [
        fin.sisaKontrak ? 'Sisa Kontrak = Pagu - Nilai Kontrak' : null,
        fin.retensi ? 'Retensi = 5% x Nilai Kontrak' : null,
        `Detail disusun per sub kegiatan (${groups.length} bagian)`,
        uncontractedFiltered.length > 0
            ? `${uncontractedFiltered.length} paket belum berkontrak (lihat halaman 2)`
            : null,
    ].filter(Boolean)
    doc.text(
        `Catatan: ${noteParts.join('. ')}.`,
        centerX,
        pageHeight - MARGIN.bottom,
        { align: 'center', maxWidth: contentWidth },
    )

    // ── Halaman 2: Rekap paket belum berkontrak ───────────────────────────
    doc.addPage()
    startY = drawHeader(
        `Rekap Paket Belum Berkontrak — Tahun ${tahun} (${uncontractedFiltered.length} paket)`,
    )

    if (uncontractedFiltered.length === 0) {
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.text(
            'Tidak ada paket pekerjaan belum berkontrak pada filter/sub kegiatan ini.',
            centerX,
            startY + 10,
            { align: 'center' },
        )
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
        uncColStyles[3] = { ...uncColStyles[3],halign: 'left' }
        uncColStyles[6] = { ...uncColStyles[6],halign: 'right' }

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
                fillColor: [239, 68, 68],
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                lineWidth: 0.1,
                lineColor: [0, 0, 0],
                halign: 'center',
            },
            bodyStyles: {
                lineWidth: 0.1,
                lineColor: [0, 0, 0],
            },
            columnStyles: uncColStyles,
            didParseCell: (data) => {
                if (data.section === 'body' && data.row.index === uncBody.length - 1) {
                    data.cell.styles.fontStyle = 'bold'
                    data.cell.styles.fillColor = [255, 247, 232]
                }
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
        doc.addPage()
        startY = drawHeader(
            `Detail: ${group.subKegiatan} (${groupIndex + 1}/${groups.length}) — Tahun ${tahun}`,
        )

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
        if (gRekap) {
            doc.setFontSize(8)
            doc.setFont('helvetica', 'normal')
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
                fillColor: [251, 133, 0],
                textColor: [0, 0, 0],
                fontStyle: 'bold',
                lineWidth: 0.1,
                lineColor: [0, 0, 0],
                halign: 'center',
            },
            bodyStyles: {
                lineWidth: 0.1,
                lineColor: [0, 0, 0],
            },
            columnStyles: detailColStyles,
        })
    })

    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(7)
        doc.setFont('helvetica', 'normal')
        doc.text(
            `Halaman ${i} dari ${pageCount}`,
            centerX,
            pageHeight - MARGIN.bottom + 4,
            { align: 'center' },
        )
    }

    const pdfBlob = doc.output('bloburl')
    window.open(pdfBlob, '_blank')
}
