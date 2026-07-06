import { describe, expect, it } from 'vitest'
import { sipdRincianCellClass, sipdValueRemoved, sipdValuesChanged, SIPD_REMOVED_CELL_CLASS } from './values-changed'

describe('sipdValuesChanged', () => {
    it('returns false for equal numbers', () => {
        expect(sipdValuesChanged(1000, 1000)).toBe(false)
        expect(sipdValuesChanged('1000', 1000)).toBe(false)
    })

    it('returns true for different numbers', () => {
        expect(sipdValuesChanged(1000, 1200)).toBe(true)
    })

    it('handles koefisien expressions', () => {
        expect(sipdValuesChanged('1 x 2', '1 x 2')).toBe(false)
        expect(sipdValuesChanged('1 x 2', '1 x 3')).toBe(true)
    })

    it('treats empty values consistently', () => {
        expect(sipdValuesChanged(null, 0)).toBe(true)
        expect(sipdValuesChanged(null, null)).toBe(false)
    })

    it('detects removed values', () => {
        expect(sipdValueRemoved(1000, null)).toBe(true)
        expect(sipdValueRemoved(1000, '')).toBe(true)
        expect(sipdValueRemoved('1 x 2', '-')).toBe(true)
        expect(sipdValueRemoved(null, 1000)).toBe(false)
    })

    it('prioritizes removed over changed styling', () => {
        expect(sipdRincianCellClass(1000, null)).toBe(SIPD_REMOVED_CELL_CLASS)
        expect(sipdRincianCellClass(1000, 1200)).not.toBe(SIPD_REMOVED_CELL_CLASS)
    })
})