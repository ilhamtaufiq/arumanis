import { describe, expect, it } from 'vitest'
import { parseNegoPdfItemLine, parseNegoPdfLines } from '../lib/parse-nego-pdf'

describe('parse-nego-pdf', () => {
    it('parses a typical PDF nego item line', () => {
        const line =
            'Pembersihan lokasi Ls 1,00 275.000,00 11,00 30.250,00 305.250,00 250.000,00 11,00 27.500,00 277.500,00'
        const item = parseNegoPdfItemLine(line, 'PEKERJAAN PERSIAPAN')
        expect(item).not.toBeNull()
        expect(item!.uraian).toMatch(/Pembersihan/i)
        expect(item!.satuan.toLowerCase()).toBe('ls')
        expect(item!.volume).toBe(1)
        // Harga negosiasi (bukan penawaran 275.000)
        expect(item!.hargaSatuan).toBe(250000)
        expect(item!.grup).toContain('PERSIAPAN')
    })

    it('parses PVC line with decimals', () => {
        const line =
            'PVC dia. 2 Inch S-12,5 RRJ m 120,00 48.290,00 11,00 637.428,00 6.432.228,00 48.290,00 11,00 637.428,00 6.432.228,00'
        const item = parseNegoPdfItemLine(line, 'PIPA')
        expect(item).not.toBeNull()
        expect(item!.volume).toBe(120)
        expect(item!.hargaSatuan).toBe(48290)
    })

    it('detects group titles and items from line list', () => {
        const lines = [
            'LAMPIRAN BERITA ACARA KLARIFIKASI TEKNIS DAN NEGOSIASI',
            'Harga Penawaran Terkoreksi Harga Negosiasi',
            'PEKERJAAN PERSIAPAN',
            'Pembersihan lokasi Ls 1,00 275.000,00 11,00 30.250,00 305.250,00 250.000,00 11,00 27.500,00 277.500,00',
            'Direksi keet ( sewa ) unit 1,00 1.000.000,00 11,00 110.000,00 1.110.000,00 900.000,00 11,00 99.000,00 999.000,00',
            'PENGADAAN DAN PEMASANGAN PIPA DAN ASESORIS',
            'PVC dia. 1 Inch S-10 SCJ m 1.500,00 23.760,00 11,00 3.920.400,00 39.560.400,00 23.760,00 11,00 3.920.400,00 39.560.400,00',
        ]
        const items = parseNegoPdfLines(lines)
        expect(items.length).toBe(3)
        expect(items[0].grup).toMatch(/PERSIAPAN/i)
        expect(items[0].hargaSatuan).toBe(250000)
        expect(items[1].hargaSatuan).toBe(900000)
        expect(items[2].grup).toMatch(/PIPA|ASESORIS/i)
        expect(items[2].volume).toBe(1500)
    })
})
