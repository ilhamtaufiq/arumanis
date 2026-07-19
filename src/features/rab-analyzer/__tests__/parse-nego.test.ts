import { describe, expect, it } from 'vitest'
import * as XLSX from 'xlsx'
import { detectNegoColumns, parseNegoRows, parseNegoWorkbook } from '../lib/parse-nego'

describe('parse-nego', () => {
    it('detects nego harga column as rightmost harga', () => {
        const header = [
            'No.',
            'Uraian Pekerjaan',
            '',
            'Satuan',
            'Volume',
            'Harga',
            'Jumlah Harga',
            'Harga',
            'Jumlah Harga',
            'Harga',
            'Jumlah Harga',
        ]
        const layout = detectNegoColumns(header)
        expect(layout.desc).toBe(1)
        expect(layout.satuan).toBe(3)
        expect(layout.volume).toBe(4)
        expect(layout.hargaNego).toBe(9)
    })

    it('parses Hasil Nego rows with negotiation unit price', () => {
        const rows = [
            ['HASIL NEGOSIASI'],
            ['', 'Kegiatan', 'Pengelolaan SPAM'],
            ['', '', '', '', '', 'HPS', '', 'Penawaran', '', 'Negosiasi'],
            [
                'No.',
                'Uraian Pekerjaan',
                '',
                'Satuan',
                'Volume',
                'Harga',
                'Jumlah Harga',
                'Harga',
                'Jumlah Harga',
                'Harga',
                'Jumlah Harga',
            ],
            ['', '', '', '', '', 'Satuan', 'termasuk Pajak', 'Satuan', 'termasuk Pajak', 'Satuan', 'termasuk Pajak'],
            ['I.', 'PEKERJAAN PERSIAPAN'],
            ['', 'Pembersihan Lokasi', '', 'ls', 1, 300000, 333000, 300000, 333000, 295643, 328163.73],
            ['', 'Papan Nama Proyek', '', 'bh', 1, 250000, 277500, 250000, 277500, 200000, 222000],
            ['II.', 'JARINGAN'],
            ['', 'PVC Ø 3 inch', '', 'm', 30, 100650, 3351645, 100650, 3351645, 99943, 3328101.9],
        ]

        const items = parseNegoRows(rows)
        expect(items.length).toBe(3)
        expect(items[0].uraian).toContain('Pembersihan')
        expect(items[0].hargaSatuan).toBe(295643)
        expect(items[0].grup).toMatch(/PERSIAPAN/i)
        expect(items[2].hargaSatuan).toBe(99943)
        expect(items[2].volume).toBe(30)
    })

    it('parses real Hasil Nego xlsx when available', () => {
        const path =
            'G:/My Drive/Work/2026/Nego/20 Hasil Nego Operasi-Pemel SPAM Desa Cikadu Kec. Cikadu (CV. Sugih JK).xlsx'
        let wb: XLSX.WorkBook
        try {
            wb = XLSX.readFile(path)
        } catch {
            // Skip if sample file not on this machine
            expect(true).toBe(true)
            return
        }

        const items = parseNegoWorkbook(wb)
        expect(items.length).toBeGreaterThan(20)
        // Harga nego ≠ HPS untuk item yang dinego
        const cleaned = items.find((i) => i.uraian.toLowerCase().includes('pembersihan'))
        if (cleaned) {
            expect(cleaned.hargaSatuan).toBeLessThanOrEqual(300000)
        }
    })
})
