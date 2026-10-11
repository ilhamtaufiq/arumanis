import { describe, expect, it } from 'vitest'
import { normalizeOptionalText, toFormText } from './profile-fields'

describe('normalizeOptionalText', () => {
    it('membuang spasi dan mengubah kosong menjadi null', () => {
        expect(normalizeOptionalText('  Penata Muda Tk. I / III/b  ')).toBe('Penata Muda Tk. I / III/b')
        expect(normalizeOptionalText('   ')).toBeNull()
        expect(normalizeOptionalText('')).toBeNull()
        expect(normalizeOptionalText(null)).toBeNull()
        expect(normalizeOptionalText(undefined)).toBeNull()
    })
})

describe('toFormText', () => {
    it('mengubah null menjadi string kosong untuk input', () => {
        expect(toFormText(null)).toBe('')
        expect(toFormText('Dinas PU')).toBe('Dinas PU')
    })
})
