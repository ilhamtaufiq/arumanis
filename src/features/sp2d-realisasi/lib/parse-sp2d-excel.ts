import * as XLSX from 'xlsx'
import type { Sp2dParseMeta, Sp2dRow } from '../types'
import {
    classifyPembayaranKategori,
    extractPaketHint,
    extractPersenPembayaran,
    extractSubKegiatanHint,
    extractSumberDana,
    isNonPekerjaanRow,
    parseIdrAmount,
    splitPenerima,
} from './normalize'

export type ParseSp2dResult = {
    meta: Sp2dParseMeta
    rows: Sp2dRow[]
}

function cellStr(row: unknown[], index: number): string {
    const v = row[index]
    if (v == null || v === '') return ''
    return String(v).trim()
}

function findHeaderRow(matrix: unknown[][]): number {
    for (let i = 0; i < Math.min(matrix.length, 20); i++) {
        const row = matrix[i] ?? []
        const joined = row.map((c) => String(c ?? '').toLowerCase()).join('|')
        if (joined.includes('nama penerima') && joined.includes('keterangan') && joined.includes('nomor sp2d')) {
            return i
        }
        // Title row "No." + "Tanggal SP2D" with sub-header next line
        if (
            String(row[0] ?? '').toLowerCase().startsWith('no') &&
            String(row[1] ?? '').toLowerCase().includes('tanggal')
        ) {
            return i
        }
    }
    return -1
}

function extractPeriodeLabel(matrix: unknown[][]): string | null {
    for (let i = 0; i < Math.min(matrix.length, 10); i++) {
        const text = (matrix[i] ?? []).map((c) => String(c ?? '')).join(' ')
        const m = text.match(/PERIODE\s*:\s*(.+)/i)
        if (m?.[1]) return m[1].trim()
    }
    return null
}

/**
 * Parse Register SP2D (Transaksi) Excel as used by Kab. Cianjur SIPD export.
 * Expected sheet "Data Realisasi" with merged header (title + subheader).
 */
export function parseSp2dExcel(buffer: ArrayBuffer, fileName: string): ParseSp2dResult {
    const workbook = XLSX.read(buffer, { type: 'array', cellDates: true })
    const sheetName =
        workbook.SheetNames.find((n) => /realisasi|sp2d|data/i.test(n)) ?? workbook.SheetNames[0]
    if (!sheetName) {
        throw new Error('File Excel tidak memiliki sheet')
    }

    const sheet = workbook.Sheets[sheetName]
    if (!sheet) {
        throw new Error(`Sheet "${sheetName}" tidak ditemukan`)
    }

    const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
        header: 1,
        defval: '',
        raw: false,
    })

    const headerIdx = findHeaderRow(matrix)
    if (headerIdx < 0) {
        throw new Error(
            'Format tidak dikenali. Pastikan file adalah Register SP2D (kolom Nama Penerima, Keterangan, Nomor SP2D).',
        )
    }

    // Data starts after header; skip sub-header row if present (Pembuatan/Pencairan/Bruto)
    let dataStart = headerIdx + 1
    const maybeSub = matrix[dataStart] ?? []
    const subJoined = maybeSub.map((c) => String(c ?? '').toLowerCase()).join('|')
    if (subJoined.includes('pembuatan') || subJoined.includes('bruto') || subJoined.includes('pencairan')) {
        dataStart += 1
    }

    const rows: Sp2dRow[] = []
    let index = 0

    for (let r = dataStart; r < matrix.length; r++) {
        const row = matrix[r] ?? []
        const no = cellStr(row, 0)
        const nomorSp2d = cellStr(row, 3)
        const namaPenerima = cellStr(row, 5)
        const keterangan = cellStr(row, 6)

        // Skip empty / footer
        if (!no && !nomorSp2d && !namaPenerima && !keterangan) continue
        if (!nomorSp2d && !namaPenerima) continue
        // Total rows
        if (/^total/i.test(no) || /^total/i.test(namaPenerima)) continue

        index += 1
        const { perusahaan, direktur } = splitPenerima(namaPenerima)
        const paketHint = extractPaketHint(keterangan)
        const subKegiatanHint = extractSubKegiatanHint(keterangan)
        const sumberDana = extractSumberDana(keterangan)
        const persenPembayaran = extractPersenPembayaran(keterangan)

        rows.push({
            index,
            fileName,
            no: no || String(index),
            tanggalPembuatan: cellStr(row, 1),
            tanggalPencairan: cellStr(row, 2),
            nomorSp2d,
            unitSkpd: cellStr(row, 4),
            namaPenerima,
            keterangan,
            jenisSp2d: cellStr(row, 7),
            bruto: parseIdrAmount(row[8]),
            potongan: parseIdrAmount(row[9]),
            neto: parseIdrAmount(row[10]),
            penyediaHint: perusahaan,
            direkturHint: direktur,
            paketHint,
            subKegiatanHint,
            sumberDana,
            persenPembayaran,
            kategori: classifyPembayaranKategori(sumberDana, persenPembayaran, keterangan),
            isNonPekerjaan: isNonPekerjaanRow(namaPenerima, keterangan),
        })
    }

    if (rows.length === 0) {
        throw new Error('Tidak ada baris data SP2D yang bisa dibaca dari file')
    }

    return {
        meta: {
            periodeLabel: extractPeriodeLabel(matrix),
            sheetName,
            fileName,
            rowCount: rows.length,
        },
        rows,
    }
}

export async function parseSp2dFile(file: File): Promise<ParseSp2dResult> {
    const buffer = await file.arrayBuffer()
    return parseSp2dExcel(buffer, file.name)
}
