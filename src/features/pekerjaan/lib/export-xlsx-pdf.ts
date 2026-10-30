import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { Berkas } from '@/features/berkas/types'
import { normalizeStorageUrl } from '@/features/foto/lib/foto-url'
import { safeDownloadFilename } from '@/lib/download-file'

/** Margin A4 dalam mm. */
const MARGIN = 10
/** Di atas jumlah kolom ini sheet dicetak landscape supaya tidak terpotong. */
const MAKS_KOLOM_PORTRAIT = 6
const NUMERIK = /^[\s\d.,()%+\-–Rp]+$/

type Baris = string[]

type SheetSiap = {
    nama: string
    /** Baris di atas header, misalnya judul dokumen. Dicetak sebagai tabel tersendiri tanpa header. */
    pembuka: Baris[]
    /** Baris header; diulang di setiap halaman. */
    head: Baris | null
    body: Baris[]
    kolom: number
}

function isSheetTersembunyi(wb: XLSX.WorkBook, index: number): boolean {
    const info = (wb.Workbook?.Sheets as { Hidden?: number }[] | undefined)?.[index]
    return !!info && info.Hidden !== undefined && info.Hidden !== 0
}

/** Ambil isi sheet tanpa baris dan kolom kosong di ujung, dengan nilai yang sudah diformat seperti di Excel. */
function siapkanSheet(sheet: XLSX.WorkSheet, nama: string): SheetSiap | null {
    const mentah = XLSX.utils.sheet_to_json<string[]>(sheet, {
        header: 1,
        defval: '',
        raw: false,
        blankrows: false,
    })
    const baris = mentah.map((r) => r.map((c) => String(c ?? '').trim()))
    const kolom = baris.reduce((maks, r) => {
        const terakhir = r.reduce((idx, c, i) => (c !== '' ? i : idx), -1)
        return Math.max(maks, terakhir + 1)
    }, 0)
    if (kolom === 0) return null

    const potong = baris.map((r) => r.slice(0, kolom))
    // Header adalah baris pertama yang punya minimal tiga sel terisi. Baris sebelumnya jadi pembuka.
    const indexHeader = potong.findIndex((r) => r.filter((c) => c !== '').length >= 3)
    if (indexHeader === -1) {
        return { nama, pembuka: [], head: null, body: potong, kolom }
    }
    return {
        nama,
        pembuka: potong.slice(0, indexHeader),
        head: potong[indexHeader],
        body: potong.slice(indexHeader + 1),
        kolom,
    }
}

function orientasiUntuk(kolom: number): 'portrait' | 'landscape' {
    return kolom > MAKS_KOLOM_PORTRAIT ? 'landscape' : 'portrait'
}

const GAYA_TABEL = {
    theme: 'grid' as const,
    styles: { fontSize: 7.5, cellPadding: 1.5, overflow: 'linebreak' as const, valign: 'middle' as const, lineColor: [160, 160, 160] as [number, number, number], lineWidth: 0.1 },
    didParseCell: (data: { section: string; cell: { raw: unknown; styles: { halign?: string } } }) => {
        const teks = String(data.cell.raw ?? '').trim()
        if (data.section === 'body' && teks !== '' && NUMERIK.test(teks)) {
            data.cell.styles.halign = 'right'
        }
    },
}

function tuliSheet(doc: jsPDF, sheet: SheetSiap) {
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text(sheet.nama, MARGIN, MARGIN + 4)
    doc.setFont('helvetica', 'normal')

    let startY = MARGIN + 9
    if (sheet.pembuka.length > 0) {
        autoTable(doc, {
            ...GAYA_TABEL,
            startY,
            margin: { left: MARGIN, right: MARGIN, bottom: MARGIN + 4 },
            body: sheet.pembuka,
        })
        const selesai = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY
        startY = (selesai ?? startY) + 4
    }

    autoTable(doc, {
        ...GAYA_TABEL,
        startY,
        margin: { left: MARGIN, right: MARGIN, bottom: MARGIN + 4 },
        head: sheet.head ? [sheet.head] : undefined,
        body: sheet.body,
        headStyles: { fillColor: [235, 235, 235], textColor: 20, fontStyle: 'bold', halign: 'center' },
    })
}

/** Ubah isi workbook menjadi PDF A4: setiap sheet mulai di halaman baru, semua sheet ikut. */
export function workbookKePdf(wb: XLSX.WorkBook, judul: string): jsPDF {
    const sheets: SheetSiap[] = []
    wb.SheetNames.forEach((nama, index) => {
        if (isSheetTersembunyi(wb, index)) return
        const siap = siapkanSheet(wb.Sheets[nama], nama)
        if (siap) sheets.push(siap)
    })
    if (sheets.length === 0) {
        throw new Error('Berkas tidak punya isi yang bisa dicetak.')
    }

    const doc = new jsPDF({ orientation: orientasiUntuk(sheets[0].kolom), unit: 'mm', format: 'a4' })
    sheets.forEach((sheet, index) => {
        if (index > 0) doc.addPage('a4', orientasiUntuk(sheet.kolom))
        tuliSheet(doc, sheet)
    })

    const total = doc.getNumberOfPages()
    const lebar = doc.internal.pageSize.getWidth()
    const tinggi = doc.internal.pageSize.getHeight()
    for (let i = 1; i <= total; i++) {
        doc.setPage(i)
        doc.setFontSize(7)
        doc.setTextColor(110)
        doc.text(judul, MARGIN, tinggi - 5)
        doc.text(`Halaman ${i} dari ${total}`, lebar - MARGIN, tinggi - 5, { align: 'right' })
        doc.setTextColor(0)
    }
    return doc
}

/** Unduh berkas xlsx dari penyimpanan lalu simpan sebagai PDF A4 berisi semua sheet. */
export async function unduhXlsxSebagaiPdf(berkas: Berkas): Promise<void> {
    const res = await fetch(normalizeStorageUrl(berkas.berkas_url))
    if (!res.ok) throw new Error(`Berkas tidak bisa diunduh (status ${res.status}).`)
    const wb = XLSX.read(await res.arrayBuffer(), { type: 'array' })

    const nama = berkas.original_name || berkas.file_name || `berkas_${berkas.id}.xlsx`
    const stem = nama.replace(/\.[^.]+$/, '')
    const doc = workbookKePdf(wb, nama)
    doc.save(safeDownloadFilename(`${stem}.pdf`, `berkas_${berkas.id}.pdf`))
}
