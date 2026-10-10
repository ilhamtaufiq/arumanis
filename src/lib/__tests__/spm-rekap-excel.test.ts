import { describe, expect, it } from 'vitest'
import { buildProjection, buildYearlyRows } from '../spm-rekap'
import { buildRekapSheets } from '../spm-rekap-excel'

const desaInputs = [
    { desaId: 1, desa: 'Ciloto', kecamatan: 'Cipanas', target: 100, capaian: 120, jiwa: 600, unit: 2, bjp: 20 },
    { desaId: 2, desa: 'Sukamaju', kecamatan: 'Cianjur', target: 100, capaian: 0, jiwa: 0, unit: 0 },
]

describe('buildRekapSheets', () => {
    it('builds summary, yearly, wilayah and matrix sheets', () => {
        const yearlyRows = buildYearlyRows([{ tahun: '2025', capaian: 20, jiwa: 100 }], 200, 100)
        const sheets = buildRekapSheets({
            title: 'Rekap',
            scopeLabel: 'Seluruh kabupaten',
            capaianLabel: 'KK Terlayani',
            showBjp: true,
            desaInputs,
            yearlyRows,
            yearlyBaseline: 100,
            projection: buildProjection(yearlyRows, 200, { targetPercent: 100, targetYear: 2029 }),
            matrix: { years: ['2025'], byYear: [desaInputs] },
            generatedAt: new Date('2026-10-06T00:00:00Z'),
        })

        expect(sheets.map((s) => s.name)).toEqual([
            'Ringkasan',
            'Per Tahun',
            'Per Kecamatan',
            'Per Desa',
            'Matriks Kecamatan',
            'Matriks Desa',
        ])
        const ringkasan = sheets[0].rows
        expect(ringkasan).toContainEqual(['Target KK', 200])
        expect(ringkasan).toContainEqual(['Sisa menuju target (KK)', 80])

        const perTahun = sheets[1].rows
        expect(perTahun[1][0]).toBe('Sebelumnya / tanpa tahun')
        expect(perTahun[2]).toContain('2025')

        const perDesa = sheets[3].rows
        expect(perDesa[0]).toContain('Dari BJP (KK)')
        expect(perDesa.at(-1)?.[1]).toBe('TOTAL')
    })

    it('omits matrix sheets when matrix not loaded', () => {
        const sheets = buildRekapSheets({
            title: 'Rekap',
            scopeLabel: '-',
            capaianLabel: 'KK',
            desaInputs,
            yearlyRows: [],
            matrix: { years: ['2025'], byYear: [undefined] },
        })
        expect(sheets).toHaveLength(4)
    })
})
