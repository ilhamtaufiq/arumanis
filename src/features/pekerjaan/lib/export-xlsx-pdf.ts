import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable, { type RowInput } from 'jspdf-autotable'
import type { Berkas } from '@/features/berkas/types'
import { normalizeStorageUrl } from '@/features/foto/lib/foto-url'
import { safeDownloadFilename } from '@/lib/download-file'

/** Margin A4 dalam mm. */
const MARGIN = 10
/** Lebar A4 portrait dalam mm. */
const A4_PORTRAIT_MM = 210
/** Piksel ke mm pada 96 dpi, seperti ukuran kolom di Excel. */
const MM_PER_PX = 25.4 / 96
/** Lebar minimum kolom dalam mm, supaya angka dan satuan pendek tetap terbaca. */
const MIN_KOLOM_MM = 9
const NUMERIK = /^[\s\d.,()%+\-–Rp]+$/

/** Satu sel siap cetak. `colSpan` dan `rowSpan` mengikuti sel gabungan di Excel. */
type Sel = {
    teks: string
    colSpan: number
    rowSpan: number
    numerik: boolean
}

type SheetSiap = {
    nama: string
    /**
     * Kop dan header tabel. Diulang di setiap halaman, seperti Print Titles di Excel.
     * Baris terakhir adalah header kolom; baris sebelumnya adalah kop dokumen.
     */
    head: Sel[][]
    body: Sel[][]
    /** Lebar setiap kolom yang dicetak, dalam piksel seperti di Excel. */
    lebarPx: number[]
}

function alamat(r: number, c: number): string {
    return XLSX.utils.encode_cell({ r, c })
}

function teksSel(cell: XLSX.CellObject | undefined): string {
    if (!cell) return ''
    if (cell.w !== undefined && cell.w !== null) return String(cell.w).trim()
    if (cell.v === undefined || cell.v === null) return ''
    return String(cell.v).trim()
}

/**
 * Lebar kolom dalam piksel. Pakai lebar asli Excel bila ada. Kalau tidak ada, ambil dari panjang isi
 * terpanjang di kolom itu, sehingga kolom uraian lebar dan kolom angka sempit.
 */
function lebarKolomPx(sheet: XLSX.WorkSheet, c: number, panjangIsi: number): number {
    const info = sheet['!cols']?.[c]
    if (info?.wpx) return info.wpx
    if (info?.wch) return Math.round(info.wch * 7 + 5)
    return Math.min(300, Math.max(40, Math.round(panjangIsi * 6.5 + 12)))
}

/** Sel dengan wrap text aktif. Tanpa data gaya, anggap tidak wrap. */
function wrapTeks(cell: XLSX.CellObject | undefined): boolean {
    return (cell as (XLSX.CellObject & { s?: { alignment?: { wrapText?: boolean } } }) | undefined)?.s?.alignment?.wrapText === true
}

function isSheetTersembunyi(wb: XLSX.WorkBook, index: number): boolean {
    const info = (wb.Workbook?.Sheets as { Hidden?: number }[] | undefined)?.[index]
    return !!info && info.Hidden !== undefined && info.Hidden !== 0
}

/**
 * Area cetak sheet dari `Print_Area` di workbook, bila ada. Excel hanya mencetak area ini,
 * sehingga kolom atau baris di luarnya tidak ikut.
 */
function areaCetak(wb: XLSX.WorkBook, index: number): XLSX.Range | null {
    const nama = (wb.Workbook?.Names ?? []) as { Name: string; Ref: string; Sheet?: number }[]
    const area = nama.find((n) => n.Name === '_xlnm.Print_Area' && n.Sheet === index)
    if (!area || !area.Ref || area.Ref.includes('#REF')) return null
    const bagian = area.Ref.slice(area.Ref.lastIndexOf('!') + 1).replace(/\$/g, '')
    try {
        return XLSX.utils.decode_range(bagian)
    } catch {
        return null
    }
}

/**
 * Ambil isi sheet dengan struktur aslinya: area cetak, sel gabungan, lebar kolom, dan kolom atau
 * baris tersembunyi. Kolom dan baris yang kosong seluruhnya dibuang agar tabel tetap ringkas.
 */
function siapkanSheet(sheet: XLSX.WorkSheet, nama: string, batas: XLSX.Range | null): SheetSiap | null {
    if (!sheet['!ref']) return null
    const dasar = XLSX.utils.decode_range(sheet['!ref'])
    const range: XLSX.Range = batas
        ? {
              s: { r: Math.max(dasar.s.r, batas.s.r), c: Math.max(dasar.s.c, batas.s.c) },
              e: { r: Math.min(dasar.e.r, batas.e.r), c: Math.min(dasar.e.c, batas.e.c) },
          }
        : dasar
    if (range.s.r > range.e.r || range.s.c > range.e.c) return null

    const kolomAktif: number[] = []
    for (let c = range.s.c; c <= range.e.c; c++) {
        if (sheet['!cols']?.[c]?.hidden !== true) kolomAktif.push(c)
    }
    const barisAktif: number[] = []
    for (let r = range.s.r; r <= range.e.r; r++) {
        if (sheet['!rows']?.[r]?.hidden !== true) barisAktif.push(r)
    }

    // Sel gabungan: origin menyimpan batas gabungan, covered menandai sel yang tertutup gabungan.
    const origin = new Map<string, XLSX.Range>()
    const covered = new Set<string>()
    for (const m of sheet['!merges'] ?? []) {
        origin.set(`${m.s.r},${m.s.c}`, m)
        for (let r = m.s.r; r <= m.e.r; r++) {
            for (let c = m.s.c; c <= m.e.c; c++) {
                if (r !== m.s.r || c !== m.s.c) covered.add(`${r},${c}`)
            }
        }
    }

    const kolom = kolomAktif.filter((c) => barisAktif.some((r) => teksSel(sheet[alamat(r, c)]) !== '' || origin.has(`${r},${c}`)))
    if (kolom.length === 0) return null

    // Panjang isi terpanjang per kolom, dengan mengabaikan sel gabungan lintas kolom.
    const panjang = new Map<number, number>()
    for (const r of barisAktif) {
        for (const c of kolom) {
            const kunci = `${r},${c}`
            if (covered.has(kunci)) continue
            const m = origin.get(kunci)
            if (m && m.e.c > m.s.c) continue
            const t = teksSel(sheet[alamat(r, c)])
            if (t.length > (panjang.get(c) ?? 0)) panjang.set(c, t.length)
        }
    }
    const lebarPx = kolom.map((c) => lebarKolomPx(sheet, c, panjang.get(c) ?? 0))
    const lebarDi = new Map(kolom.map((c, i) => [c, lebarPx[i]]))

    // Sel kosong yang boleh ditimpa luberan teks dari sel kiri (tanpa sel gabungan dan tanpa isi).
    const kosong = (r: number, c: number) => {
        const kunci = `${r},${c}`
        return !covered.has(kunci) && !origin.has(kunci) && teksSel(sheet[alamat(r, c)]) === ''
    }

    const hasil: Sel[][] = []
    for (const r of barisAktif) {
        const baris: Sel[] = []
        let i = 0
        while (i < kolom.length) {
            const c = kolom[i]
            const kunci = `${r},${c}`
            if (covered.has(kunci)) {
                i++
                continue
            }
            const m = origin.get(kunci)
            let colSpan = m ? kolom.filter((k) => k >= c && k <= m.e.c).length || 1 : 1
            const rowSpan = m ? barisAktif.filter((rr) => rr >= r && rr <= m.e.r).length || 1 : 1
            const cell = sheet[alamat(r, c)]
            const teks = teksSel(cell)
            const numerik = teks !== '' && NUMERIK.test(teks)
            // Teks tanpa wrap meluber ke sel kosong di kanannya, seperti di Excel.
            if (!m && teks !== '' && !numerik && !wrapTeks(cell)) {
                const butuh = teks.length * 6 + 8
                let lebar = lebarDi.get(c) ?? 0
                while (i + colSpan < kolom.length && lebar < butuh && kosong(r, kolom[i + colSpan])) {
                    lebar += lebarDi.get(kolom[i + colSpan]) ?? 0
                    colSpan++
                }
            }
            baris.push({ teks, colSpan, rowSpan, numerik })
            i += colSpan
        }
        const ada = baris.some((s) => s.teks !== '' || s.colSpan > 1 || s.rowSpan > 1)
        if (ada) hasil.push(baris)
    }
    if (hasil.length === 0) return null

    // Header kolom adalah baris pertama dengan minimal tiga sel terisi. Baris di atasnya jadi kop.
    const indexHeader = hasil.findIndex((baris) => baris.filter((s) => s.teks !== '').length >= 3)
    if (indexHeader === -1) {
        return { nama, head: [], body: hasil, lebarPx }
    }
    return {
        nama,
        head: hasil.slice(0, indexHeader + 1),
        body: hasil.slice(indexHeader + 1),
        lebarPx,
    }
}

/**
 * Bagi area cetak ke kolom. Kolom yang sudah sempit dipertahankan lebarnya. Kolom lebar (uraian)
 * dipotong sampai seluruh tabel muat. Bila tabel lebih sempit dari area, sisanya dibagi proporsional.
 */
function lebarMm(natural: number[], usable: number): number[] {
    const total = natural.reduce((a, b) => a + b, 0) || 1
    if (total <= usable) return natural.map((w) => (w * usable) / total)
    if (natural.reduce((a, w) => a + Math.min(w, MIN_KOLOM_MM), 0) >= usable) {
        return natural.map(() => usable / natural.length)
    }
    let lo = MIN_KOLOM_MM
    let hi = Math.max(...natural)
    for (let i = 0; i < 40; i++) {
        const tengah = (lo + hi) / 2
        const jumlah = natural.reduce((a, w) => a + Math.min(w, tengah), 0)
        if (jumlah > usable) hi = tengah
        else lo = tengah
    }
    return natural.map((w) => Math.min(w, lo))
}

/**
 * Orientasi. Landscape bila kolom minimumnya saja tidak muat di portrait, atau bila lebar alami
 * tabel lebih dari 1,6 kali area portrait sehingga teks uraian akan terlalu dipadatkan.
 */
function orientasiUntuk(lebarPx: number[]): 'portrait' | 'landscape' {
    const usable = A4_PORTRAIT_MM - 2 * MARGIN
    const minimal = lebarPx.reduce((a, px) => a + Math.min(px * MM_PER_PX, MIN_KOLOM_MM), 0)
    const alami = lebarPx.reduce((a, px) => a + px * MM_PER_PX, 0)
    return minimal > usable || alami > usable * 1.6 ? 'landscape' : 'portrait'
}

function keSel(s: Sel, styles: Record<string, unknown> = {}): Record<string, unknown> {
    return {
        content: s.teks,
        colSpan: s.colSpan,
        rowSpan: s.rowSpan,
        styles: { halign: s.numerik ? 'right' : 'left', ...styles },
    }
}

/** Ubah baris sel ke bentuk yang diterima autoTable. Bentuk sel sudah sesuai dokumentasi library. */
function keBaris(rows: Sel[][], styles?: Record<string, unknown>): RowInput[] {
    return rows.map((baris) => baris.map((s) => keSel(s, styles))) as unknown as RowInput[]
}

function tuliSheet(doc: jsPDF, sheet: SheetSiap) {
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text(sheet.nama, MARGIN, MARGIN + 4)
    doc.setFont('helvetica', 'normal')

    const usable = doc.internal.pageSize.getWidth() - 2 * MARGIN
    const alamiMm = sheet.lebarPx.reduce((a, b) => a + b, 0) * MM_PER_PX
    // Huruf tetap terbaca. Hanya turun sedikit bila tabel jauh lebih lebar dari area cetak.
    const huruf = alamiMm > usable * 1.6 ? 6 : 7

    // Baris kop dicetak biasa, baris header terakhir diberi latar abu-abu dan tebal.
    const kop = sheet.head.slice(0, -1)
    const header = sheet.head.slice(-1)
    const head = sheet.head.length
        ? [
              ...keBaris(kop, { fontStyle: 'bold' }),
              ...keBaris(header, { fillColor: [235, 235, 235], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'center' }),
          ]
        : undefined

    autoTable(doc, {
        theme: 'grid',
        startY: MARGIN + 9,
        head,
        body: keBaris(sheet.body),
        styles: {
            fontSize: huruf,
            cellPadding: 1,
            textColor: [0, 0, 0],
            overflow: 'linebreak',
            valign: 'middle',
            lineColor: [160, 160, 160],
            lineWidth: 0.1,
        },
        columnStyles: Object.fromEntries(
            lebarMm(sheet.lebarPx.map((px) => px * MM_PER_PX), usable).map((w, i) => [i, { cellWidth: w }])
        ),
        tableWidth: usable,
        margin: { left: MARGIN, right: MARGIN, bottom: MARGIN + 4 },
    })
}

/**
 * Ubah isi workbook menjadi PDF A4. Setiap sheet yang terlihat dan punya isi dicetak mulai di
 * halaman baru, dengan area cetak dari Excel bila ada.
 */
export function workbookKePdf(wb: XLSX.WorkBook, judul: string): jsPDF {
    const sheets: SheetSiap[] = []
    wb.SheetNames.forEach((nama, index) => {
        if (isSheetTersembunyi(wb, index)) return
        const siap = siapkanSheet(wb.Sheets[nama], nama, areaCetak(wb, index))
        if (siap) sheets.push(siap)
    })
    if (sheets.length === 0) {
        throw new Error('Berkas tidak punya isi yang bisa dicetak.')
    }

    const doc = new jsPDF({ orientation: orientasiUntuk(sheets[0].lebarPx), unit: 'mm', format: 'a4', compress: true })
    sheets.forEach((sheet, index) => {
        if (index > 0) doc.addPage('a4', orientasiUntuk(sheet.lebarPx))
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
    // cellStyles wajib agar lebar kolom (<cols>) ikut terbaca.
    const wb = XLSX.read(await res.arrayBuffer(), { type: 'array', cellStyles: true })

    const nama = berkas.original_name || berkas.file_name || `berkas_${berkas.id}.xlsx`
    const stem = nama.replace(/\.[^.]+$/, '')
    const doc = workbookKePdf(wb, nama)
    doc.save(safeDownloadFilename(`${stem}.pdf`, `berkas_${berkas.id}.pdf`))
}
