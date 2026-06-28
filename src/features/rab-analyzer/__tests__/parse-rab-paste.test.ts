import { describe, expect, it } from 'vitest'
import { analyzeRabItems } from '../lib/calculate-rab-totals'
import { parseIndonesianNumber } from '../lib/parse-indonesian-number'
import { parseBestImportRows, parseRabPaste } from '../lib/parse-rab-paste'

describe('parseIndonesianNumber', () => {
    it('parses Indonesian thousand separators', () => {
        expect(parseIndonesianNumber('1.500.000')).toBe(1500000)
        expect(parseIndonesianNumber('Rp 2.480.825')).toBe(2480825)
    })

    it('parses plain numbers', () => {
        expect(parseIndonesianNumber('150000')).toBe(150000)
        expect(parseIndonesianNumber(25000)).toBe(25000)
    })
})

describe('parseAirMinumRabRows via parseBestImportRows', () => {
    it('parses standard RAB air minum column layout', () => {
        const rows = [
            ['', 'Pekerjaan Persiapan', '', '', '', '', '', '', ''],
            ['', 'Papan Nama', '', '', '', '', 'ls', 1, '500.000'],
            ['', 'Galian Tanah', '', '', '', '', 'm3', 10, '75.000'],
        ]

        const items = parseBestImportRows(rows)
        expect(items).toHaveLength(2)
        expect(items[0].grup).toBe('Pekerjaan Persiapan')
        expect(items[0].uraian).toBe('Papan Nama')
        expect(items[0].satuan).toBe('ls')
        expect(items[0].volume).toBe(1)
        expect(items[0].hargaSatuan).toBe(500000)
    })
})

describe('parseRabPaste', () => {
    it('parses tab-separated paste text', () => {
        const text = [
            '\tPekerjaan Persiapan\t\t\t\t\t\t\t',
            '\tPapan Nama\t\t\t\t\tls\t1\t500.000',
        ].join('\n')

        const items = parseRabPaste(text)
        expect(items.length).toBe(1)
        expect(items[0].uraian).toBe('Papan Nama')
        expect(items[0].hargaSatuan).toBe(500000)
    })
})

describe('analyzeRabItems', () => {
    it('calculates DPP, PPN 11%, and total', () => {
        const result = analyzeRabItems([
            {
                grup: 'Grup A',
                uraian: 'Item 1',
                satuan: 'ls',
                volume: 2,
                hargaSatuan: 100000,
            },
        ])

        expect(result.items[0].jumlah).toBe(200000)
        expect(result.items[0].ppn).toBe(22000)
        expect(result.items[0].total).toBe(222000)
        expect(result.summary.subtotalDpp).toBe(200000)
        expect(result.summary.totalPpn).toBe(22000)
        expect(result.summary.grandTotal).toBe(222000)
    })
})