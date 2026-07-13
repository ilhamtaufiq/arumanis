import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { PengawasKpiNotesReportRow } from '../api/pengawas-kpi'
import { PROGRESS_FISIK_EXPORT_TITLE } from '../utils/export-shared'

const MARGIN = { left: 14, right: 14, top: 12, bottom: 14 } as const

type ExportPengawasKpiPdfParams = {
    rows: PengawasKpiNotesReportRow[]
    tahun: number
    peranLabel?: string
    title?: string
}

/**
 * Export PDF catatan kelengkapan paket pengawas.
 * Kolom: No | Nama Paket Pekerjaan | Catatan
 */
export function exportPengawasKpiNotesPdf({
    rows,
    tahun,
    peranLabel,
    title = PROGRESS_FISIK_EXPORT_TITLE,
}: ExportPengawasKpiPdfParams) {
    if (!rows.length) return

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const contentWidth = pageWidth - MARGIN.left - MARGIN.right
    const centerX = pageWidth / 2
    const now = new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'long',
        timeStyle: 'short',
    }).format(new Date())

    let y = MARGIN.top + 2

    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text(title, centerX, y, { align: 'center', maxWidth: contentWidth })
    y += 6

    doc.setFontSize(11)
    doc.text('Catatan Kelengkapan Paket Pekerjaan — KPI Pengawas', centerX, y, {
        align: 'center',
        maxWidth: contentWidth,
    })
    y += 5

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    const meta = [
        `Tahun anggaran ${tahun}`,
        peranLabel ? `Peran: ${peranLabel}` : null,
        `${rows.length} paket`,
    ]
        .filter(Boolean)
        .join(' · ')
    doc.text(meta, centerX, y, { align: 'center' })
    y += 4
    doc.text(`Dicetak: ${now}`, centerX, y, { align: 'center' })
    y += 6

    const body = rows.map((row) => [
        String(row.no),
        row.nama_paket || '-',
        row.catatan || '-',
    ])

    /** Index baris kritis: tanpa output (atau progress/PHO vs kelengkapan) */
    const criticalRowIndexes = new Set(
        rows
            .map((row, index) => {
                const c = row.catatan || ''
                const isCritical =
                    /\[KRITIS\]|output komponen belum/i.test(c) ||
                    (row.output_count === 0 &&
                        (row.pho_completed ||
                            (row.progress_realisasi != null && row.progress_realisasi >= 100)))
                return isCritical ? index : -1
            })
            .filter((i) => i >= 0),
    )

    const warningRowIndexes = new Set(
        rows
            .map((row, index) => {
                if (criticalRowIndexes.has(index)) return -1
                const c = row.catatan || ''
                const isWarn =
                    /\[PERHATIAN\]|belum lengkap|sudah pho tetapi|belum diinput|belum ada/i.test(c)
                return isWarn ? index : -1
            })
            .filter((i) => i >= 0),
    )

    autoTable(doc, {
        head: [['No', 'Nama Paket Pekerjaan', 'Catatan']],
        body,
        startY: y,
        theme: 'grid',
        margin: { left: MARGIN.left, right: MARGIN.right },
        tableWidth: contentWidth,
        styles: {
            fontSize: 8,
            cellPadding: 2,
            valign: 'top',
            overflow: 'linebreak',
            lineWidth: 0.1,
            lineColor: [0, 0, 0],
        },
        headStyles: {
            fillColor: [26, 26, 46],
            textColor: [255, 183, 3],
            fontStyle: 'bold',
            halign: 'center',
        },
        columnStyles: {
            0: { cellWidth: 12,halign: 'center' },
            1: { cellWidth: contentWidth * 0.38,halign: 'left' },
            2: { cellWidth: contentWidth * 0.52,halign: 'left' },
        },
        didParseCell: (data) => {
            if (data.section !== 'body') return
            const rowIndex = data.row.index
            if (criticalRowIndexes.has(rowIndex)) {
                // Merah: tanpa output / progress 100% atau PHO tanpa data pendukung
                data.cell.styles.fillColor = [254, 202, 202]
                data.cell.styles.textColor = [127, 29, 29]
                if (data.column.index === 2) {
                    data.cell.styles.fontStyle = 'bold'
                }
            } else if (warningRowIndexes.has(rowIndex)) {
                data.cell.styles.fillColor = [255, 247, 232]
            }
        },
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

    const blobUrl = doc.output('bloburl')
    window.open(blobUrl, '_blank')
}
