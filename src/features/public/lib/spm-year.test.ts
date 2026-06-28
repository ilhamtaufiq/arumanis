import { describe, expect, it } from 'bun:test'
import { buildSpmTahunQueryParam, parseSpmTahun } from './spm-year'

describe('parseSpmTahun', () => {
    it('returns undefined for empty or invalid values', () => {
        expect(parseSpmTahun(undefined)).toBeUndefined()
        expect(parseSpmTahun('')).toBeUndefined()
        expect(parseSpmTahun('1999')).toBeUndefined()
        expect(parseSpmTahun('abc')).toBeUndefined()
    })

    it('accepts supported achievement years', () => {
        expect(parseSpmTahun('2026')).toBe('2026')
        expect(parseSpmTahun('2020')).toBe('2020')
    })
})

describe('buildSpmTahunQueryParam', () => {
    it('omits param when no year is selected', () => {
        expect(buildSpmTahunQueryParam()).toBeUndefined()
        expect(buildSpmTahunQueryParam('')).toBeUndefined()
    })

    it('includes tahun when a year is selected', () => {
        expect(buildSpmTahunQueryParam('2025')).toEqual({ tahun: '2025' })
    })
})