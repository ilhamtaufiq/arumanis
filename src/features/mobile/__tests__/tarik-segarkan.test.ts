import { describe, expect, it } from 'vitest'
import { AMBANG_SEGARKAN, JARAK_MAKS, jarakTarik, perluSegarkan } from '../lib/tarik-segarkan'

describe('tarik untuk segarkan', () => {
    it('tarikan ke atas tidak menghasilkan jarak', () => {
        expect(jarakTarik(-40)).toBe(0)
        expect(jarakTarik(0)).toBe(0)
    })
    it('tarikan dilemahkan dan dibatasi', () => {
        expect(jarakTarik(100)).toBe(50)
        expect(jarakTarik(1000)).toBe(JARAK_MAKS)
    })
    it('segarkan hanya di atas ambang', () => {
        expect(perluSegarkan(AMBANG_SEGARKAN - 1)).toBe(false)
        expect(perluSegarkan(AMBANG_SEGARKAN)).toBe(true)
    })
})
