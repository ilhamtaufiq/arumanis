import {
    PDF_REPORT_HEADER_MM,
    PDF_REPORT_FOOTER_MM,
    drawReportPdfFooter,
    drawReportPdfHeader,
    loadReportPdfLogosSelective,
} from '@/features/pekerjaan/lib/export-pdf-branding'

const MARGIN = {
    top: PDF_REPORT_HEADER_MM,
    right: 14,
    bottom: PDF_REPORT_FOOTER_MM + 2,
    left: 14,
} as const

type Block = { kind: 'text'; lines: string[] } | { kind: 'table'; head: string[]; body: string[][] }

/** Pecah markdown jawaban jadi blok teks + tabel GFM (chart JSON dibuang). */
function parseAnswer(markdown: string): Block[] {
    const clean = markdown.replace(/```json\n[\s\S]*?\n```/g, '').trim()
    const lines = clean.split('\n')
    const blocks: Block[] = []
    let text: string[] = []
    let i = 0

    const flushText = () => {
        const trimmed = text.join('\n').trim()
        if (trimmed) blocks.push({ kind: 'text', lines: trimmed.split('\n') })
        text = []
    }

    const isDelim = (line: string) => /^\|?[\s:|-]+\|?[\s:|.-]*$/.test(line.trim()) && line.includes('-')
    const splitRow = (line: string): string[] => {
        let t = line.trim()
        if (t.startsWith('|')) t = t.slice(1)
        if (t.endsWith('|')) t = t.slice(0, -1)
        return t.split('|').map((c) => inlineText(c.trim()))
    }

    while (i < lines.length) {
        const line = lines[i]
        const next = lines[i + 1] ?? ''
        if (line.trim().startsWith('|') && isDelim(next)) {
            flushText()
            const head = splitRow(line)
            const body: string[][] = []
            i += 2
            while (i < lines.length && lines[i].trim().startsWith('|')) {
                if (!isDelim(lines[i])) body.push(splitRow(lines[i]))
                i++
            }
            blocks.push({ kind: 'table', head, body })
            continue
        }
        text.push(inlineText(line))
        i++
    }
    flushText()
    return blocks
}

/** Bersihkan sintaks inline: bold, link [x](y) → x, code, heading #. */
function inlineText(line: string): string {
    return line
        .replace(/^#{1,6}\s+/, '')
        .replace(/\*\*(.+?)\*\*/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/`([^`]+)`/g, '$1')
        .trim()
}

/** Export satu tabel → PDF kop Disperkim (landscape A4, gaya export pekerjaan). */
export async function exportTablePdf(headers: string[], rows: string[][], title: string): Promise<void> {
    const { default: jsPDF } = await import('jspdf')
    const { default: autoTable } = await import('jspdf-autotable')
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
    const pageW = doc.internal.pageSize.getWidth()
    const contentW = pageW - MARGIN.left - MARGIN.right
    const timestamp = new Date().toLocaleString('id-ID')
    const logos = await loadReportPdfLogosSelective({ showCianjur: true })
    const headerOpts = {
        logos,
        title,
        metaLine: `Dicetak: ${timestamp} · Arumanis`,
        marginLeft: MARGIN.left,
        marginRight: MARGIN.right,
        logoVisibility: { showCianjur: true },
    }
    drawReportPdfHeader(doc, headerOpts)
    autoTable(doc, {
        head: [headers],
        body: rows.length > 0 ? rows : [['-']],
        theme: 'grid',
        tableWidth: contentW,
        margin: { ...MARGIN },
        headStyles: {
            fillColor: [37, 99, 235],
            textColor: 255,
            fontStyle: 'bold',
            halign: 'center',
            fontSize: 8,
            cellPadding: 1.5,
        },
        styles: {
            fontSize: 7.5,
            cellPadding: 1.5,
            overflow: 'linebreak',
            textColor: [15, 23, 42],
            lineColor: [203, 213, 225],
            lineWidth: 0.15,
        },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        didDrawPage: () => drawReportPdfHeader(doc, headerOpts),
    })
    const total = doc.getNumberOfPages()
    for (let p = 1; p <= total; p++) {
        doc.setPage(p)
        drawReportPdfFooter(doc, {
            pageNumber: p,
            totalPages: total,
            marginLeft: MARGIN.left,
            marginRight: MARGIN.right,
            printedAt: timestamp,
            leftLabel: 'AI Generated · Bidang Air Minum dan Sanitasi · Disperkim Cianjur',
        })
    }
    doc.save(`tabel-ami-${Date.now()}.pdf`)
}

/** Export satu jawaban asisten → PDF kop Disperkim (portrait A4). */
export async function exportAnswerPdf(answerMarkdown: string, question: string): Promise<void> {
    const { default: jsPDF } = await import('jspdf')
    const { default: autoTable } = await import('jspdf-autotable')
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const pageW = doc.internal.pageSize.getWidth()
    const contentW = pageW - MARGIN.left - MARGIN.right
    const timestamp = new Date().toLocaleString('id-ID')
    const logos = await loadReportPdfLogosSelective({ showCianjur: true })
    const logoVisibility = { showCianjur: true }

    const header = () =>
        drawReportPdfHeader(doc, {
            logos,
            title: 'RINGKASAN ASISTEN AI',
            subtitle: question.length > 140 ? question.slice(0, 140) + '…' : question,
            metaLine: `Dicetak: ${timestamp} · Arumanis`,
            marginLeft: MARGIN.left,
            marginRight: MARGIN.right,
            logoVisibility,
        })

    let top = header()

    for (const block of parseAnswer(answerMarkdown)) {
        if (block.kind === 'table') {
            autoTable(doc, {
                head: [block.head],
                body: block.body.length > 0 ? block.body : [['-']],
                theme: 'grid',
                tableWidth: contentW,
                margin: { ...MARGIN, top },
                headStyles: {
                    fillColor: [37, 99, 235],
                    textColor: 255,
                    fontStyle: 'bold',
                    halign: 'center',
                    fontSize: 8,
                    cellPadding: 1.5,
                },
                styles: {
                    fontSize: 7.5,
                    cellPadding: 1.5,
                    overflow: 'linebreak',
                    textColor: [15, 23, 42],
                    lineColor: [203, 213, 225],
                    lineWidth: 0.15,
                },
                alternateRowStyles: { fillColor: [248, 250, 252] },
                didDrawPage: () => {
                    top = header()
                },
            })
            top = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 4
        } else {
            doc.setFont('helvetica', 'normal')
            doc.setFontSize(9)
            doc.setTextColor(15, 23, 42)
            for (const line of block.lines) {
                const wrapped = doc.splitTextToSize(line === '' ? ' ' : line, contentW)
                for (const w of wrapped) {
                    if (top > doc.internal.pageSize.getHeight() - MARGIN.bottom) {
                        doc.addPage('a4', 'portrait')
                        top = header()
                    }
                    doc.text(w, MARGIN.left, top)
                    top += 4.2
                }
            }
            top += 2
        }
    }

    const total = doc.getNumberOfPages()
    for (let p = 1; p <= total; p++) {
        doc.setPage(p)
        drawReportPdfFooter(doc, {
            pageNumber: p,
            totalPages: total,
            marginLeft: MARGIN.left,
            marginRight: MARGIN.right,
            printedAt: timestamp,
            leftLabel: 'AI Generated · Bidang Air Minum dan Sanitasi · Disperkim Cianjur',
        })
    }
    doc.save(`ringkasan-ami-${Date.now()}.pdf`)
}
