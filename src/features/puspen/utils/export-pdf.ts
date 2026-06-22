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
    const headers = [['No', 'Nama Paket Pekerjaan', 'Kode Paket', 'Sub Kegiatan', 'Rencana (%)', 'Realisasi (%)', 'Deviasi (%)', 'Update']]

    const body = items.map((item, index) => {
        const deviasi = item.rencana !== null && item.realisasi !== null
            ? Number((item.realisasi - item.rencana).toFixed(2))
            : null

        const updatedAt = item.updatedAt
            ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(item.updatedAt))
            : '-'

        return [
            String(index + 1),
            item.namaPaket || '-',
            item.kodePaket || '-',
            item.subKegiatan || '-',
            item.rencana !== null ? String(item.rencana) : '-',
            item.realisasi !== null ? String(item.realisasi) : '-',
            deviasi !== null ? String(deviasi) : '-',
            updatedAt,
        ]
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
            1: { cellWidth: 80, halign: 'left' },
            2: { cellWidth: 40, halign: 'left' },
            3: { cellWidth: 55, halign: 'left' },
            4: { cellWidth: 22 },
            5: { cellWidth: 22 },
            6: { cellWidth: 22 },
            7: { cellWidth: 35 },
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
