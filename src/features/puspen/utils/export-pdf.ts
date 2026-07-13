import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { PuspenProgressFisikItem } from '../api/progress-fisik'
import {
    buildSubKegiatanRekap,
    filterAndGroupBySubKegiatan,
    flattenGroupedItems,
    formatCurrencyId,
    formatDateId,
    formatNumberId,
    formatUpdatedAt,
    phoLabel,
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
    title = PROGRESS_FISIK_EXPORT_TITLE,
}: ExportPdfParams) {
    const groups = filterAndGroupBySubKegiatan(items, options.subKegiatan)
    const filteredItems = flattenGroupedItems(groups)
    if (!filteredItems.length) return

    const { period } = options
    // A4 landscape — muat kolom lebar, margin seimbang
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
    const pageWidth = doc.internal.pageSize.getWidth() // ~297
    const pageHeight = doc.internal.pageSize.getHeight() // ~210
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
        doc.text(`Dicetak: ${now}`, centerX, y, { align: 'center' })

        return y + 4 // startY untuk tabel
    }

    // ── Halaman 1: Rekap per sub kegiatan ──────────────────────────────────
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
        formatCurrencyId(row.pagu),
        formatCurrencyId(row.nilaiKontrak),
        formatCurrencyId(row.sisaKontrak),
        formatCurrencyId(row.retensi),
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
        formatCurrencyId(totalPagu),
        formatCurrencyId(totalNilai),
        formatCurrencyId(totalSisa),
        formatCurrencyId(totalRetensi),
        '',
    ])

    const rekapColStyles = scaleColumnWidths(
        [8, 48, 12, 16, 18, 16, 28, 28, 28, 26, 22],
        contentWidth,
    )
    rekapColStyles[1] = { ...rekapColStyles[1], halign: 'left' }
    rekapColStyles[6] = { ...rekapColStyles[6], halign: 'right' }
    rekapColStyles[7] = { ...rekapColStyles[7], halign: 'right' }
    rekapColStyles[8] = { ...rekapColStyles[8], halign: 'right' }
    rekapColStyles[9] = { ...rekapColStyles[9], halign: 'right' }

    autoTable(doc, {
        head: [[
            'No',
            'Sub Kegiatan',
            'Paket',
            'Rencana (%)',
            'Realisasi (%)',
            'Deviasi (%)',
            'Pagu',
            'Nilai Kontrak',
            'Sisa Kontrak',
            'Retensi (5%)',
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
    doc.text(
        `Catatan: Sisa Kontrak = Pagu - Nilai Kontrak. Retensi = 5% x Nilai Kontrak. Detail disusun per sub kegiatan (${groups.length} bagian).`,
        centerX,
        pageHeight - MARGIN.bottom,
        { align: 'center', maxWidth: contentWidth },
    )

    // ── Detail per sub kegiatan ───────────────────────────────────────────
    const detailHead = [[
        'No',
        'Paket',
        'Rencana (%)',
        'Realisasi (%)',
        'Deviasi (%)',
        'Pagu',
        'Nilai Kontrak',
        'Sisa Kontrak',
        'Retensi (5%)',
        'PHO',
        'Update',
    ]]

    const detailColStyles = scaleColumnWidths(
        [8, 55, 16, 16, 14, 28, 28, 28, 24, 14, 24],
        contentWidth,
    )
    detailColStyles[1] = { ...detailColStyles[1], halign: 'left' }
    detailColStyles[5] = { ...detailColStyles[5], halign: 'right' }
    detailColStyles[6] = { ...detailColStyles[6],halign: 'right' }
    detailColStyles[7] = { ...detailColStyles[7],halign: 'right' }
    detailColStyles[8] = { ...detailColStyles[8],halign: 'right' }

    groups.forEach((group, groupIndex) => {
        doc.addPage()
        startY = drawHeader(
            `Detail: ${group.subKegiatan} (${groupIndex + 1}/${groups.length}) — Tahun ${tahun}`,
        )

        const body = group.items.map((item, index) => [
            String(index + 1),
            item.namaPaket || '-',
            item.rencana !== null ? formatNumberId(item.rencana) : '-',
            item.realisasi !== null ? formatNumberId(item.realisasi) : '-',
            item.deviasi !== null ? formatNumberId(item.deviasi) : '-',
            formatCurrencyId(item.pagu),
            formatCurrencyId(item.nilaiKontrak),
            formatCurrencyId(item.sisaKontrak),
            formatCurrencyId(item.retensi),
            phoLabel(item.phoCompleted),
            formatUpdatedAt(item.updatedAt),
        ])

        const gRekap = buildSubKegiatanRekap(group.items)[0]
        if (gRekap) {
            doc.setFontSize(8)
            doc.setFont('helvetica', 'normal')
            doc.text(
                `${gRekap.count} paket · Rencana ${formatNumberId(gRekap.rencana)}% · Realisasi ${formatNumberId(gRekap.realisasi)}% · Pagu ${formatCurrencyId(gRekap.pagu)} · Nilai Kontrak ${formatCurrencyId(gRekap.nilaiKontrak)}`,
                centerX,
                startY,
                { align: 'center', maxWidth: contentWidth },
            )
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

    // Footer nomor halaman — center
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
