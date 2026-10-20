import { describe, expect, it } from 'vitest'
import { looksLikeRabRincian, parseRabRincian } from '../lib/parse-rab-rincian'

// Potongan sheet RAB dengan kolom: B=NO, C=URAIAN, D=uraian rinci, H=SAT, I=VOLUME, J=HARGA, K=JUMLAH.
function baris(n: number, cells: Record<number, unknown>): unknown[] {
    const row: unknown[] = Array(n).fill(null)
    for (const [k, v] of Object.entries(cells)) row[Number(k)] = v
    return row
}

const rows: unknown[][] = [
    baris(12, { 1: 'NO', 2: 'URAIAN PEKERJAAN', 7: 'SAT', 8: 'VOLUME', 9: 'HARGA', 10: 'JUMLAH' }),
    baris(12, { 1: 'I', 2: 'PEKERJAAN PERSIAPAN' }),
    baris(12, { 1: '1', 2: 'Pembersihan lokasi', 7: 'Ls', 8: 1, 9: 300000, 10: 300000 }),
    baris(12, { 1: '2', 2: 'Dokumentasi dan Pelaporan' }),
    baris(12, { 2: 'a.', 3: 'Foto Kegiatan', 7: 'set', 8: 3, 9: 150000, 10: 450000 }),
    baris(12, { 2: 'SUB TOTAL  I', 10: 750000 }),
    baris(12, { 1: 'II', 2: 'PEMBUATAN SUMUR BOR' }),
    baris(12, { 1: '1', 2: 'Pemboran pilot hole diameter 4"', 7: "m'", 8: 80, 9: 520970 }),
    baris(12, { 2: 'SUB TOTAL  II', 10: 41677600 }),
    baris(12, { 1: 'V', 2: 'DUDUKAN TORN' }),
    baris(12, { 1: '1', 2: 'Kran umum', 7: 'unit', 8: 2, 9: 500000 }),
    baris(12, { 2: 'SUB TOTAL  V', 10: 0 }),
    baris(12, { 2: 'JUMLAH TOTAL DANA', 10: 792000 }),
]

describe('parseRabRincian', () => {
    it('menandai hasil tidak lengkap bila ada bagian tanpa SUB TOTAL', () => {
        const tanpaSubtotal = rows.filter((row) => !String(row[2] ?? '').startsWith('SUB TOTAL  I'))
        expect(parseRabRincian(tanpaSubtotal).lengkap).toBe(false)
    })

    it('mengenali format rincian RAB', () => {
        expect(looksLikeRabRincian(rows)).toBe(true)
        expect(looksLikeRabRincian([['NAMA', 'LAIN']])).toBe(false)
    })

    it('mengambil item per bagian dengan judul bagian sebagai grup', () => {
        const { items, warnings, lengkap } = parseRabRincian(rows)
        expect(lengkap).toBe(true)
        expect(items).toEqual([
            { grup: 'I. PEKERJAAN PERSIAPAN', uraian: 'Pembersihan lokasi', satuan: 'Ls', volume: 1, hargaSatuan: 300000 },
            { grup: 'I. PEKERJAAN PERSIAPAN', uraian: 'Foto Kegiatan', satuan: 'set', volume: 3, hargaSatuan: 150000 },
            { grup: 'II. PEMBUATAN SUMUR BOR', uraian: 'Pemboran pilot hole diameter 4"', satuan: "m'", volume: 80, hargaSatuan: 520970 },
        ])
        expect(warnings.some((w) => w.includes('DUDUKAN TORN'))).toBe(true)
    })

    it('mencocokkan jumlah item dengan subtotal per bagian', () => {
        const { items, warnings } = parseRabRincian(rows)
        const total = items.reduce((t, i) => t + i.volume * i.hargaSatuan, 0)
        expect(total).toBe(750000 + 41677600)
        expect(warnings.filter((w) => w.includes('tidak sama'))).toEqual([])
    })

})
