import { describe, expect, it } from 'vitest'
import {
    getPengawasAppUrl,
    isPengawasUser,
    normalizeRoleSlug,
    shouldRedirectToPengawasApp,
} from '../pengawas-app'

describe('pengawas-app role redirect', () => {
    it('recognizes pengawas and konsultan_pengawas slugs', () => {
        expect(isPengawasUser(['pengawas'])).toBe(true)
        expect(isPengawasUser(['konsultan_pengawas'])).toBe(true)
        expect(isPengawasUser([{ name: 'konsultan_pengawas' }])).toBe(true)
    })

    it('recognizes human-readable Konsultan Pengawas label', () => {
        expect(normalizeRoleSlug('Konsultan Pengawas')).toBe('konsultan_pengawas')
        expect(isPengawasUser(['Konsultan Pengawas'])).toBe(true)
    })

    it('redirects pengawas and konsultan users to pengawasan app', () => {
        expect(shouldRedirectToPengawasApp(['pengawas'])).toBe(true)
        expect(shouldRedirectToPengawasApp(['konsultan_pengawas'])).toBe(true)
        expect(shouldRedirectToPengawasApp(['Konsultan Pengawas'])).toBe(true)
    })

    it('does not redirect admin or manager even with pengawas role', () => {
        expect(shouldRedirectToPengawasApp(['admin', 'pengawas'])).toBe(false)
        expect(shouldRedirectToPengawasApp(['manager', 'konsultan_pengawas'])).toBe(false)
    })

    it('does not redirect unrelated roles', () => {
        expect(shouldRedirectToPengawasApp(['tfl'])).toBe(false)
        expect(shouldRedirectToPengawasApp([])).toBe(false)
    })

    it('routes handoff through pengawasan login with one-time code', () => {
        expect(getPengawasAppUrl('abc|code')).toBe('/pengawasan/login?code=abc%7Ccode')
        expect(getPengawasAppUrl()).toBe('/pengawasan/')
    })
})