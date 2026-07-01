import { describe, expect, it } from 'vitest'
import {
    filterPublicSpmMapStats,
    isReservedSpmMapStat,
    isReservedWilayahName,
} from '../spm-reserved-wilayah'

describe('spm-reserved-wilayah', () => {
    it('detects reserved placeholder names', () => {
        expect(isReservedWilayahName(null)).toBe(true)
        expect(isReservedWilayahName('')).toBe(true)
        expect(isReservedWilayahName('NULL')).toBe(true)
        expect(isReservedWilayahName('NULLs')).toBe(true)
        expect(isReservedWilayahName('  nulls  ')).toBe(true)
        expect(isReservedWilayahName('Cianjur')).toBe(false)
    })

    it('filters map stats rows with reserved desa or kecamatan', () => {
        const rows = [
            { desa_id: 1, desa: 'Sukamaju', kecamatan: 'Cianjur' },
            { desa_id: 999, desa: 'NULLs', kecamatan: 'NULL' },
            { desa_id: 2, desa: 'Mekar', kecamatan: 'NULLs' },
        ]

        const filtered = filterPublicSpmMapStats(rows)
        expect(filtered).toHaveLength(1)
        expect(filtered[0].desa_id).toBe(1)
        expect(isReservedSpmMapStat({ desa: 'NULL', kecamatan: 'Cugenang' })).toBe(true)
    })
})