type ReportPdfTable = {
    head: string[][]
    body: string[][]
    columnStyles?: Record<number, { cellWidth?: number | 'auto'; halign?: 'left' | 'center' | 'right' }>
}

type BuildReportPdfOptions = {
    title: string
    subtitle: string
    filename: string
    table: ReportPdfTable
}

/** PDF landscape A4 berkop (branding Arumanis) — dipakai ulang semua laporan. */
export async function buildReportPdf({ title, subtitle, filename, table }: BuildReportPdfOptions): Promise<void> {
    const jsPDF = (await import('jspdf')).default
    const autoTable = (await import('jspdf-autotable')).default
    const { drawReportPdfHeader, drawReportPdfFooter, loadReportPdfLogosSelective } = await import(
        '@/features/pekerjaan/lib/export-pdf-branding'
    )

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
    const logos = await loadReportPdfLogosSelective({ showCianjur: true, showAms: false, showArumanis: false })
    const margin = { top: 42, right: 12, bottom: 14, left: 12 }

    autoTable(doc, {
        head: table.head,
        body: table.body,
        startY: margin.top,
        margin,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
        columnStyles: table.columnStyles ?? {
            0: { cellWidth: 12, halign: 'center' },
            1: { cellWidth: 'auto' },
        },
        didDrawPage: (data) => {
            drawReportPdfHeader(doc, {
                logos,
                title,
                subtitle,
                metaLine: `Dicetak: ${new Date().toLocaleString('id-ID')}`,
                marginLeft: margin.left,
                marginRight: margin.right,
                logoVisibility: { showCianjur: true },
            })
            drawReportPdfFooter(doc, {
                pageNumber: data.pageNumber,
                marginLeft: margin.left,
                marginRight: margin.right,
            })
        },
    })

    doc.save(filename)
}
