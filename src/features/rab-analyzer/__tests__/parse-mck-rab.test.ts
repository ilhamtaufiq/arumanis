import { describe, expect, it } from 'vitest'
import { analyzeRabItems } from '../lib/calculate-rab-totals'
import { parseRabPaste, parseRabPasteText } from '../lib/parse-rab-paste'

const MCK_SAMPLE = `No\tItem Pekerjaan\t\tSatuan\tVolume\tHarga Satuan\tJumlah Harga Satuan
\t\t\t\t\t\t45.045.358
I\tPekerjaan Persiapan\t\t\t\t\t
1\tSewa Direksi Keet\t\tLs\t1,00\t200.000\t200.000
2\tPasangan 1 m' bouwplank\t\tm'\t12,00\t74.500\t894.000
\tJUMLAH\t\t\t\t\t1.094.000
II\tSMKK\t\t\t\t\t
1\tInduksi K3 (Safety Induction)\t\tOrg\t3,00\t10.000\t30.000
V\tPekerjaan Beton\t\t\t\t\t
A\tPekerjaan Sloof Beton\t\t\t\t\t
1\tPembuatan 1 m' balok praktis beton bertulang (10x15)\t\tm'\t9,55\t147.800\t1.411.490
B\tPekerjaan Plat Lantai Beton\t\t\t\t\t
1\t 1 kg penulangan slab untuk BjTP atau BjTS dia. < 12 mm, cara manual (untuk bangunan gedung)\t\tkg\t4,74\t17.100\t81.054
III\tPekerjaan Tanah\t\t\t\t\t
1\t"Penggalian 1 m3 tanah biasa sedalam 0 s.d. 1 m untuk volume s.d. 200 m3 secara manual 
"\t\tm³\t6,60\t89.100\t588.183
XIV\tPekerjaan Lain-Lain\t\t\t\t\t
2\tPemasangan Signage Acrylic\t\tbh\t1,00\t350.000\t350.000`

describe('parseMckRabRows', () => {
    it('parses MCK RAB paste with groups, subgroups, and comma decimals', () => {
        const items = parseRabPaste(MCK_SAMPLE)

        expect(items.length).toBeGreaterThanOrEqual(7)

        const sewa = items.find((item) => item.uraian.includes('Sewa Direksi Keet'))
        expect(sewa).toMatchObject({
            grup: 'Pekerjaan Persiapan',
            satuan: 'Ls',
            volume: 1,
            hargaSatuan: 200000,
        })

        const sloof = items.find((item) => item.uraian.includes('balok praktis beton'))
        expect(sloof?.grup).toContain('Pekerjaan Beton')
        expect(sloof?.grup).toContain('Pekerjaan Sloof Beton')
        expect(sloof?.volume).toBe(9.55)

        const signage = items.find((item) => item.uraian.includes('Signage Acrylic'))
        expect(signage?.grup).toBe('Pekerjaan Lain-Lain')
    })

    it('skips JUMLAH rows and header totals', () => {
        const items = parseRabPaste(MCK_SAMPLE)
        expect(items.some((item) => item.uraian.toLowerCase() === 'jumlah')).toBe(false)
        expect(items.some((item) => item.hargaSatuan === 45045358)).toBe(false)
    })

    it('handles multiline quoted item descriptions', () => {
        const items = parseRabPaste(MCK_SAMPLE)
        const galian = items.find((item) => item.uraian.toLowerCase().includes('penggalian 1 m3 tanah'))
        expect(galian).toBeDefined()
        expect(galian?.satuan).toBe('m³')
        expect(galian?.volume).toBe(6.6)
        expect(galian?.hargaSatuan).toBe(89100)
    })

    it('calculates PPN for parsed MCK items', () => {
        const items = parseRabPaste(MCK_SAMPLE)
        const analysis = analyzeRabItems(items)
        expect(analysis.summary.itemCount).toBe(items.length)
        expect(analysis.summary.grandTotal).toBeGreaterThan(analysis.summary.subtotalDpp)
    })

    it('detects tab-separated rows from Excel paste', () => {
        const rows = parseRabPasteText('1\tSewa Direksi Keet\t\tLs\t1,00\t200.000\t200.000')
        expect(rows[0][3]).toBe('Ls')
        expect(rows[0][4]).toBe('1,00')
    })
})