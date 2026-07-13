import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { PuspenProgressFisikItem } from '../api/progress-fisik'
import {
    buildSubKegiatanRekap,
    formatCurrencyId,
    formatDateId,
    formatNumberId,
    formatUpdatedAt,
    phoLabel,
    type ExportPeriod,
} from './export-shared'

type ExportPdfParams = {
    items: PuspenProgressFisikItem[]
    tahun: number
    period: ExportPeriod
    title?: string
}

export function exportProgressFisikPdf({
    items,
    tahun,
    period,
    title = 'PUSPEN ARUMANIS',
}: ExportPdfParams) {
    if (!items.length) return

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const now = new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'long',
        timeStyle: 'short',
    }).format(new Date())

    const drawHeader = (subtitle: string) => {
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text(title, pageWidth / 2, 12, { align: 'center' })

        doc.setFontSize(11)
        doc.text(subtitle, pageWidth / 2, 18, { align: 'center' })

        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        doc.text(
            `Periode laporan: ${formatDateId(period.startDate)} s/d ${formatDateId(period.endDate)}`,
            pageWidth / 2,
            24,
            { align: 'center' },
        )
        doc.text(`Dicetak: ${now}`, pageWidth - 12, 10, { align: 'right' })
    }

    // ── Halaman 1: Rekap per sub kegiatan ──────────────────────────────────
    drawHeader(`Rekap Progress Fisik per Sub Kegiatan — Tahun ${tahun}`)

    const rekap = buildSubKegiatanRekap(items)
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
        startY: 28,
        theme: 'grid',
        margin: { left: 6, right: 6 },
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
        },
        bodyStyles: {
            lineWidth: 0.1,
            lineColor: [0, 0, 0],
        },
        columnStyles: {
            0: { cellWidth: 8 },
            1: { cellWidth: 48, halign: 'left' },
            2: { cellWidth: 12 },
            3: { cellWidth: 18 },
            4: { cellWidth: 20 },
            5: { cellWidth: 18 },
            6: { cellWidth: 28, halign: 'right' },
            7: { cellWidth: 28, halign: 'right' },
            8: { cellWidth: 28, halign: 'right' },
            9: { cellWidth: 26, halign: 'right' },
            10: { cellWidth: 24 },
        },
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
        'Catatan: Sisa Kontrak = Pagu - Nilai Kontrak. Retensi = 5% x Nilai Kontrak. Rencana/Realisasi adalah rata-rata per sub kegiatan.',
        8,
        pageHeight - 14,
    )

    // ── Halaman 2+: Detail per paket ───────────────────────────────────────
    doc.addPage()
    drawHeader(`Detail Progress Fisik per Paket — Tahun ${tahun}`)

    const detailBody = items.map((item, index) => [
        String(index + 1),
        item.namaPaket || '-',
        item.subKegiatan || '-',
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

    autoTable(doc, {
        head: [[
            'No',
            'Paket',
            'Sub Kegiatan',
            'Rencana (%)',
            'Realisasi (%)',
            'Deviasi (%)',
            'Pagu',
            'Nilai Kontrak',
            'Sisa Kontrak',
            'Retensi (5%)',
            'PHO',
            'Update',
        ]],
        body: detailBody,
        startY: 28,
        theme: 'grid',
        margin: { left: 5, right: 5 },
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
        },
        bodyStyles: {
            lineWidth: 0.1,
            lineColor: [0, 0, 0],
        },
        columnStyles: {
            0: { cellWidth: 8 },
            1: { cellWidth: 42, halign: 'left' },
            2: { cellWidth: 32, halign: 'left' },
            3: { cellWidth: 16 },
            4: { cellWidth: 16 },
            5: { cellWidth: 14 },
            6: { cellWidth: 24, halign: 'right' },
            7: { cellWidth: 24, halign: 'right' },
            8: { cellWidth: 24, halign: 'right' },
            9: { cellWidth: 22, halign: 'right' },
            10: { cellWidth: 14 },
            11: { cellWidth: 24 },
        },
    })

    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(7)
        doc.setFont('helvetica', 'normal')
        doc.text(
            `Halaman ${i} dari ${pageCount}`,
            pageWidth - 12,
            pageHeight - 8,
            { align: 'right' },
        )
    }

    const pdfBlob = doc.output('bloburl')
    window.open(pdfBlob, '_blank')
}
