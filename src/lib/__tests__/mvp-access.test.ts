import { describe, expect, it } from 'vitest'
import { canViewAdvancedMvpFeatures } from '@/lib/mvp-access'

describe('canViewAdvancedMvpFeatures', () => {
    it('allows admin and manager roles', () => {
        expect(canViewAdvancedMvpFeatures(['admin'])).toBe(true)
        expect(canViewAdvancedMvpFeatures(['manager'])).toBe(true)
        expect(canViewAdvancedMvpFeatures([{ name: 'Admin' }])).toBe(true)
    })

    it('denies standard operational roles', () => {
        expect(canViewAdvancedMvpFeatures(['user'])).toBe(false)
        expect(canViewAdvancedMvpFeatures(['pengawas'])).toBe(false)
        expect(canViewAdvancedMvpFeatures([])).toBe(false)
    })
})