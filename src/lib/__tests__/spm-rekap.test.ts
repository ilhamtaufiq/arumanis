import { describe, expect, it } from 'vitest'
import {
    aggregateByKecamatan,
    buildCsv,
    buildDesaRows,
    buildYearlyRows,
    countTiers,
    getCoverageTier,
    getLatestIncrease,
    getPeakYear,
    sortWilayahRows,
    summarizeRows,
    type SpmRekapDesaInput,
} from '../spm-rekap'

const desaInputs: SpmRekapDesaInput[] = [
    { desaId: 1, desa: 'Ciloto', kecamatan: 'Cipanas', target: 100, capaian: 120, jiwa: 600, unit: 2, sr: 110 },
    { desaId: 2, desa: 'Sindanglaya', kecamatan: 'Cipanas', target: 200, capaian: 50, jiwa: 250, unit: 1, sr: 40 },
    { desaId: 3, desa: 'Sukamaju', kecamatan: 'Cianjur', target: 100, capaian: 0, jiwa: 0, unit: 0 },
]

describe('spm-rekap', () => {
    it('builds desa rows with gap and coverage', () => {
        const [ciloto, sindanglaya, sukamaju] = buildDesaRows(desaInputs)
        expect(ciloto.coverage).toBe(120)
        expect(ciloto.gap).toBe(0)
        expect(ciloto.desaTuntas).toBe(1)
        expect(sindanglaya.coverage).toBe(25)
        expect(sindanglaya.gap).toBe(150)
        expect(sukamaju.desaTanpaCapaian).toBe(1)
    })

    it('aggregates per kecamatan', () => {
        const rows = aggregateByKecamatan(desaInputs)
        const cipanas = rows.find((row) => row.nama === 'Cipanas')
        expect(cipanas).toMatchObject({
            target: 300,
            capaian: 170,
            desaCount: 2,
            desaTuntas: 1,
            desaTanpaCapaian: 0,
            sr: 150,
        })
        expect(cipanas?.coverage).toBeCloseTo(56.67, 1)
    })

    it('summarizes and counts tiers', () => {
        const rows = buildDesaRows(desaInputs)
        const summary = summarizeRows(rows)
        expect(summary.target).toBe(400)
        expect(summary.capaian).toBe(170)
        expect(summary.gap).toBe(230)
        expect(countTiers(rows)).toEqual({ none: 1, low: 1, mid: 0, high: 0, full: 1 })
        expect(getCoverageTier(null)).toBe('none')
        expect(getCoverageTier(75)).toBe('high')
    })

    it('sorts rows by coverage and name', () => {
        const rows = buildDesaRows(desaInputs)
        expect(sortWilayahRows(rows, 'coverage', 'asc').map((r) => r.nama)).toEqual([
            'Sukamaju',
            'Sindanglaya',
            'Ciloto',
        ])
        expect(sortWilayahRows(rows, 'nama', 'asc')[0].nama).toBe('Ciloto')
    })

    it('builds yearly rows with cumulative and increase', () => {
        const rows = buildYearlyRows(
            [
                { tahun: '2024', capaian: 30, jiwa: 150 },
                { tahun: '2023', capaian: 20, jiwa: 100 },
                { tahun: '2025', capaian: 0, jiwa: 0 },
            ],
            200,
        )
        expect(rows.map((r) => r.tahun)).toEqual(['2023', '2024', '2025'])
        expect(rows[0].delta).toBeNull()
        expect(rows[1].delta).toBe(10)
        expect(rows[1].deltaPct).toBe(50)
        expect(rows[1].kumulatif).toBe(50)
        expect(rows[1].coverageKumulatif).toBe(25)
        expect(rows[2].deltaPct).toBe(-100)
        expect(getLatestIncrease(rows)?.tahun).toBe('2024')
        expect(getPeakYear(rows)?.tahun).toBe('2024')
    })

    it('starts cumulative from baseline', () => {
        const rows = buildYearlyRows([{ tahun: '2024', capaian: 10, jiwa: 50 }], 100, 40)
        expect(rows[0].kumulatif).toBe(50)
        expect(rows[0].coverageKumulatif).toBe(50)
    })

    it('escapes csv values', () => {
        expect(buildCsv(['a', 'b'], [['x;y', 1]])).toBe('a;b\n"x;y";1')
    })
})
