import { describe, expect, it } from 'vitest'
import {
    buildAirMinumYearlyPoint,
    buildSanitasiYearlyPoint,
    getSpmYearlyTrendYears,
    sortYearlyTrendPoints,
} from '../spm-yearly-trend'

describe('spm-yearly-trend', () => {
    it('orders years chronologically', () => {
        expect(getSpmYearlyTrendYears()[0]).toBe('2020')
        expect(getSpmYearlyTrendYears().at(-1)).toBe('2026')

        const sorted = sortYearlyTrendPoints([
            { tahun: '2024', coverage: 10, coverageKk: 10, kk: 1, jiwa: 4, target: 10, units: 1 },
            { tahun: '2022', coverage: 5, coverageKk: 5, kk: 1, jiwa: 4, target: 10, units: 1 },
        ])

        expect(sorted.map((point) => point.tahun)).toEqual(['2022', '2024'])
    })

    it('extracts air minum yearly metrics', () => {
        const point = buildAirMinumYearlyPoint(
            {
                total_units: 12,
                coverage_percentage: 42,
                capaian_kk: 120,
                capaian_jiwa: 480,
                total_target: 300,
            } as never,
            '2025',
        )

        expect(point.tahun).toBe('2025')
        expect(point.coverage).toBe(42)
        expect(point.kk).toBe(120)
        expect(point.units).toBe(12)
    })

    it('extracts sanitasi yearly metrics', () => {
        const point = buildSanitasiYearlyPoint(
            {
                coverage_percentage: 55,
                coverage_kk_percentage: 48,
                total_pemanfaat_kk: 90,
                total_pemanfaat_jiwa: 360,
                target_kk: 200,
                total_count: 7,
            },
            '2024',
        )

        expect(point.coverageKk).toBe(48)
        expect(point.kk).toBe(90)
        expect(point.units).toBe(7)
    })
})