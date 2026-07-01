import { describe, expect, it } from 'vitest'
import {
    buildAirMinumDesaRows,
    buildSanitasiDesaRows,
    calcSpmDesaCoverage,
    filterSpmDesaRows,
    filterSpmDesaRowsByCoverageTier,
    filterSpmDesaRowsByKecamatan,
    findSpmDesaRowPage,
    getDuplicateDesaNameKeys,
    getUniqueKecamatans,
    paginateSpmDesaRows,
    sortSpmDesaRows,
} from '../spm-desa-table'
import { normalizeWilayahKey } from '@/features/map/utils/map-utils'
import { parseSpmSector } from '../spm-sector'

describe('spm-desa-table', () => {
    it('calculates capped coverage percentage', () => {
        expect(calcSpmDesaCoverage(50, 100)).toBe(50)
        expect(calcSpmDesaCoverage(150, 100)).toBe(100)
        expect(calcSpmDesaCoverage(10, 0)).toBe(0)
    })

    it('builds air minum rows with coverage', () => {
        const rows = buildAirMinumDesaRows([
            {
                desa_id: 1,
                desa: 'Sukamaju',
                kecamatan: 'Cianjur',
                target: 100,
                unit_count: 2,
                sr: 80,
                kk: 40,
                jiwa: 160,
            },
        ])

        expect(rows[0].coverage).toBe(40)
        expect(rows[0].sector).toBe('air_minum')
    })

    it('filters and sorts rows', () => {
        const rows = buildSanitasiDesaRows([
            {
                desa_id: 1,
                desa: 'Sukamaju',
                kecamatan: 'Cianjur',
                jumlah_penduduk: 1000,
                target_kk: 200,
                unit_count: 1,
                pemanfaat_kk: 50,
                pemanfaat_jiwa: 200,
            },
            {
                desa_id: 2,
                desa: 'Mekarjaya',
                kecamatan: 'Cugenang',
                jumlah_penduduk: 800,
                target_kk: 150,
                unit_count: 1,
                pemanfaat_kk: 120,
                pemanfaat_jiwa: 480,
            },
        ])

        const filtered = filterSpmDesaRows(rows, 'cugenang')
        expect(filtered).toHaveLength(1)
        expect(filtered[0].desa).toBe('Mekarjaya')

        const sorted = sortSpmDesaRows(rows, 'coverage', 'desc')
        expect(sorted[0].desa).toBe('Mekarjaya')
    })

    it('paginates rows', () => {
        const rows = buildAirMinumDesaRows(
            Array.from({ length: 30 }, (_, index) => ({
                desa_id: index + 1,
                desa: `Desa ${index + 1}`,
                kecamatan: 'Cianjur',
                target: 100,
                unit_count: 1,
                sr: 10,
                kk: 10,
                jiwa: 40,
            })),
        )

        const page = paginateSpmDesaRows(rows, 2, 25)
        expect(page.rows).toHaveLength(5)
        expect(page.totalPages).toBe(2)
    })

    it('filters by kecamatan and coverage tier', () => {
        const rows = buildAirMinumDesaRows([
            {
                desa_id: 1,
                desa: 'Sukamaju',
                kecamatan: 'Cianjur',
                target: 100,
                unit_count: 1,
                sr: 80,
                kk: 70,
                jiwa: 280,
            },
            {
                desa_id: 2,
                desa: 'Mekarjaya',
                kecamatan: 'Cugenang',
                target: 100,
                unit_count: 1,
                sr: 10,
                kk: 10,
                jiwa: 40,
            },
        ])

        expect(filterSpmDesaRowsByKecamatan(rows, 'Cugenang')).toHaveLength(1)
        expect(filterSpmDesaRowsByCoverageTier(rows, 'high')).toHaveLength(1)
        expect(getUniqueKecamatans(rows)).toEqual(['Cianjur', 'Cugenang'])
        expect(findSpmDesaRowPage(rows, 2, 25)).toBe(1)
    })

    it('parses sector search values', () => {
        expect(parseSpmSector('sanitasi')).toBe('sanitasi')
        expect(parseSpmSector('air_minum')).toBe('air_minum')
        expect(parseSpmSector('invalid')).toBe('air_minum')
    })

    it('excludes reserved NULL/NULLs placeholder desa from table rows', () => {
        const rows = buildAirMinumDesaRows([
            {
                desa_id: 1,
                desa: 'Sukamaju',
                kecamatan: 'Cianjur',
                target: 100,
                unit_count: 1,
                sr: 10,
                kk: 10,
                jiwa: 40,
            },
            {
                desa_id: 999,
                desa: 'NULLs',
                kecamatan: 'NULL',
                target: 0,
                unit_count: 0,
                sr: 0,
                kk: 0,
                jiwa: 0,
            },
        ])

        expect(rows).toHaveLength(1)
        expect(rows[0].desa).toBe('Sukamaju')
    })

    it('keeps duplicate desa names distinct by kecamatan when sorting', () => {
        const rows = buildAirMinumDesaRows([
            {
                desa_id: 10,
                desa: 'Cikadu',
                kecamatan: 'Cikadu',
                target: 100,
                unit_count: 1,
                sr: 20,
                kk: 20,
                jiwa: 80,
            },
            {
                desa_id: 20,
                desa: 'Cikadu',
                kecamatan: 'Campaka',
                target: 100,
                unit_count: 1,
                sr: 40,
                kk: 40,
                jiwa: 160,
            },
        ])

        const sorted = sortSpmDesaRows(rows, 'desa', 'asc')
        expect(sorted.map((row) => row.desa_id)).toEqual([20, 10])
        expect(getDuplicateDesaNameKeys(rows).has('cikadu')).toBe(true)
        expect(normalizeWilayahKey('Cikadu', 'Cikadu')).not.toBe(
            normalizeWilayahKey('Cikadu', 'Campaka'),
        )
    })
})