import { describe, expect, it } from 'vitest'
import { isSpmDetailPageActive } from '../api'

describe('spm detail page setting', () => {
    it('treats enabled and unset values as active', () => {
        expect(isSpmDetailPageActive([{ id: 1, key: 'spm_detail_page_active', value: '1', type: 'text', updated_at: '' }])).toBe(true)
        expect(isSpmDetailPageActive([])).toBe(true)
        expect(isSpmDetailPageActive(undefined)).toBe(true)
    })

    it('treats disabled value as inactive', () => {
        expect(isSpmDetailPageActive([{ id: 1, key: 'spm_detail_page_active', value: '0', type: 'text', updated_at: '' }])).toBe(false)
    })
})