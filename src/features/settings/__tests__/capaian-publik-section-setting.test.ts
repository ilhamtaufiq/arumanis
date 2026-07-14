import { describe, expect, it } from 'vitest'
import { isCapaianPublikSectionActive } from '../api'

describe('capaian publik section setting', () => {
    it('treats enabled and unset values as active', () => {
        expect(
            isCapaianPublikSectionActive([
                {
                    id: 1,
                    key: 'capaian_publik_section_active',
                    value: '1',
                    type: 'text',
                    updated_at: '',
                },
            ]),
        ).toBe(true)
        expect(isCapaianPublikSectionActive([])).toBe(true)
        expect(isCapaianPublikSectionActive(undefined)).toBe(true)
    })

    it('treats disabled value as inactive', () => {
        expect(
            isCapaianPublikSectionActive([
                {
                    id: 1,
                    key: 'capaian_publik_section_active',
                    value: '0',
                    type: 'text',
                    updated_at: '',
                },
            ]),
        ).toBe(false)
    })
})
