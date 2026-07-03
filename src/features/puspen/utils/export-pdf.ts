import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { PuspenProgressFisikItem } from '../api/progress-fisik'

type ExportPdfParams = {
    items: PuspenProgressFisikItem[]
    tahun: number
    title?: string
}

export function exportProgressFisikPdf({ items, tahun, title = 'PUSPEN ARUMANIS' }: ExportPdfParams) {
    if (!items.length) return

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
    const pageWidth = doc.internal.pageSize.getWidth()

    // Title
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text(title, pageWidth / 2, 15, { align: 'center' })

    // Subtitle
    doc.setFontSize(11)
    doc.text(`Estimasi Progress Fisik - Tahun ${tahun}`, pageWidth / 2, 22, { align: 'center' })

    // Date
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    const now = new Intl.DateTimeFormat('id-ID', { dateStyle: 'long', timeStyle: 'short' }).format(new Date())
    doc.text(`Dicetak: ${now}`, pageWidth - 15, 28, { align: 'right' })

    // Table
    const headers = [['No', 'Paket', 'Sub Kegiatan', 'Rencana (%)', 'Realisasi (%)', 'Deviasi (%)', 'Komponen', 'Volume', 'Satuan', 'Realisasi Output', 'PHO', 'Update']]

    const body = items.flatMap((item, index) => {
        const outputs = item.outputs.length > 0 ? item.outputs : [null]
        const updatedAt = item.updatedAt
            ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(item.updatedAt))
            : '-'

        return outputs.map((output) => [
            String(index + 1),
            item.namaPaket || '-',
            item.subKegiatan || '-',
            item.rencana !== null ? String(item.rencana) : '-',
            item.realisasi !== null ? String(item.realisasi) : '-',
            item.deviasi !== null ? String(item.deviasi) : '-',
            output?.komponen ?? '-',
            output?.volume !== undefined ? String(output.volume) : '-',
            output?.satuan ?? '-',
            output?.realisasi !== null && output?.realisasi !== undefined
                ? String(output.realisasi)
                : '-',
            item.phoCompleted ? 'Ya' : 'Tidak',
            updatedAt,
        ])
    })

    autoTable(doc, {
        head: headers,
        body,
        startY: 32,
        theme: 'grid',
        margin: { left: 5, right: 5 },
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
            1: { cellWidth: 42, halign: 'left' },
            2: { cellWidth: 32, halign: 'left' },
            3: { cellWidth: 16 },
            4: { cellWidth: 16 },
            5: { cellWidth: 16 },
            6: { cellWidth: 30, halign: 'left' },
            7: { cellWidth: 14 },
            8: { cellWidth: 12 },
            9: { cellWidth: 16 },
            10: { cellWidth: 26 },
        },
    })

    // Footer — page numbers
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(7)
        doc.setFont('helvetica', 'normal')
        doc.text(`Halaman ${i} dari ${pageCount}`, pageWidth - 15, doc.internal.pageSize.getHeight() - 10, { align: 'right' })
    }

    const pdfBlob = doc.output('bloburl')
    window.open(pdfBlob, '_blank')
}
