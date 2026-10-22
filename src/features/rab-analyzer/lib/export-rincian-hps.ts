import * as XLSX from 'xlsx'
import { downloadBlob } from '@/lib/download-file'
import type { RabAnalysisResult } from '../types'
import { PAJAK_PERSEN, rapikanTeks } from './rapikan-teks'

/** Nama sheet dan header harus sama persis dengan template SPSE (pembacaan kolom by name). */
const SHEET_NAME = 'rincian-hps'
const HEADER = ['Satuan', 'Jenis Barang/Jasa', 'Vol', 'Harga', 'Pajak(%)', 'Keterangan', 'Kunci'] as const

export function buildRincianHpsWorkbook(result: RabAnalysisResult): XLSX.WorkBook {
    const rows = result.items.map((item) => ({
        Satuan: rapikanTeks(item.satuan),
        'Jenis Barang/Jasa': rapikanTeks(item.uraian),
        Vol: item.volume,
        Harga: item.hargaSatuan,
        'Pajak(%)': PAJAK_PERSEN,
        Keterangan: rapikanTeks(item.grup),
        Kunci: '',
    }))

    const sheet = XLSX.utils.json_to_sheet(rows, { header: [...HEADER] })
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, sheet, SHEET_NAME)
    return workbook
}

export function downloadRincianHps(result: RabAnalysisResult): void {
    const workbook = buildRincianHpsWorkbook(result)
    const bytes = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' }) as ArrayBuffer
    const blob = new Blob([bytes], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    downloadBlob(blob, 'rincian-hps.xlsx')
}
