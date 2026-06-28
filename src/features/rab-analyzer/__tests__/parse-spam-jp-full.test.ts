import { readFileSync } from 'fs'
import { join } from 'path'
import { describe, expect, it } from 'vitest'
import { analyzeRabItems } from '../lib/calculate-rab-totals'
import { parseRabPaste } from '../lib/parse-rab-paste'

const FULL_SAMPLE = readFileSync(
    join(__dirname, 'fixtures', 'spam-jp-full-sample.txt'),
    'utf8',
)

describe('parseSpamJpFullSample', () => {
    it('parses the full SPAM JP RAB with 80+ billable items', () => {
        const items = parseRabPaste(FULL_SAMPLE)
        expect(items.length).toBeGreaterThanOrEqual(80)
    })

    it('keeps Roman section groups instead of narrative description rows', () => {
        const items = parseRabPaste(FULL_SAMPLE)
        expect(items.some((item) => item.grup.includes('Meliputi galian'))).toBe(false)
        expect(items.some((item) => item.grup.includes('cincin karet'))).toBe(false)

        const pvc = items.find((item) => item.uraian.includes('PVC dia. 3"') && item.satuan === "m'")
        expect(pvc?.grup).toContain('PENGADAAN DAN PEMASANGAN PIPA')
    })

    it('matches known section subtotals from the Excel paste', () => {
        const items = parseRabPaste(FULL_SAMPLE)
        const sumByMain = items.reduce<Record<string, number>>((acc, item) => {
            const main = item.grup.split(' › ')[0]
            acc[main] = (acc[main] ?? 0) + item.volume * item.hargaSatuan
            return acc
        }, {})

        expect(sumByMain['PEKERJAAN PERSIAPAN']).toBeCloseTo(3_750_000, 0)
        expect(sumByMain['PEKERJAAN SAMBUNGAN RUMAH']).toBeCloseTo(32_122_410.1, 0)
        expect(sumByMain['PENYELENGGARAAN SISTEM MANAJEMEN KESELAMATAN KONSTRUKSI (SMKK)']).toBeCloseTo(1_000_000, 0)

        const sectionII = sumByMain['PENGADAAN DAN PEMASANGAN PIPA DAN ASESORIS'] ?? 0
        expect(sectionII).toBeCloseTo(186_448_377.59, -2)
    })

    it('calculates PPN 11% on parsed DPP', () => {
        const items = parseRabPaste(FULL_SAMPLE)
        const analysis = analyzeRabItems(items)
        expect(analysis.summary.totalPpn).toBeCloseTo(analysis.summary.subtotalDpp * 0.11, 0)
        expect(analysis.summary.grandTotal).toBeGreaterThan(270_000_000)
    })
})