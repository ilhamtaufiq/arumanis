import { describe, expect, it } from 'vitest'
import {
    getPengawasAppUrl,
    isOperatorUser,
    isPengawasUser,
    needsDashboardDestinationChoice,
    normalizeRoleSlug,
    shouldRedirectToPengawasApp,
} from '../pengawas-app'

describe('pengawas-app role redirect', () => {
    it('recognizes pengawas, konsultan_pengawas, and tfl as field roles', () => {
        expect(isPengawasUser(['pengawas'])).toBe(true)
        expect(isPengawasUser(['konsultan_pengawas'])).toBe(true)
        expect(isPengawasUser([{ name: 'konsultan_pengawas' }])).toBe(true)
        expect(isPengawasUser(['tfl'])).toBe(true)
        expect(isPengawasUser(['TFL'])).toBe(true)
    })

    it('recognizes human-readable Konsultan Pengawas label', () => {
        expect(normalizeRoleSlug('Konsultan Pengawas')).toBe('konsultan_pengawas')
        expect(isPengawasUser(['Konsultan Pengawas'])).toBe(true)
    })

    it('recognizes operator role', () => {
        expect(isOperatorUser(['operator'])).toBe(true)
        expect(isOperatorUser(['Operator'])).toBe(true)
        expect(isOperatorUser(['pengawas'])).toBe(false)
    })

    it('detects dual operator + pengawas for destination choice', () => {
        expect(needsDashboardDestinationChoice(['operator', 'pengawas'])).toBe(true)
        expect(needsDashboardDestinationChoice(['operator', 'konsultan_pengawas'])).toBe(true)
        expect(needsDashboardDestinationChoice(['Operator', 'Pengawas'])).toBe(true)
        expect(needsDashboardDestinationChoice(['pengawas'])).toBe(false)
        expect(needsDashboardDestinationChoice(['operator'])).toBe(false)
        expect(needsDashboardDestinationChoice(['admin', 'operator', 'pengawas'])).toBe(false)
    })

    it('redirects pure field roles to pengawasan app', () => {
        expect(shouldRedirectToPengawasApp(['pengawas'])).toBe(true)
        expect(shouldRedirectToPengawasApp(['konsultan_pengawas'])).toBe(true)
        expect(shouldRedirectToPengawasApp(['Konsultan Pengawas'])).toBe(true)
        expect(shouldRedirectToPengawasApp(['tfl'])).toBe(true)
    })

    it('does not auto-redirect dual operator + field role (needs modal choice)', () => {
        expect(shouldRedirectToPengawasApp(['operator', 'pengawas'])).toBe(false)
        expect(shouldRedirectToPengawasApp(['operator', 'konsultan_pengawas'])).toBe(false)
        expect(shouldRedirectToPengawasApp(['operator', 'tfl'])).toBe(false)
        expect(needsDashboardDestinationChoice(['operator', 'tfl'])).toBe(true)
    })

    it('does not redirect admin or manager even with field role', () => {
        expect(shouldRedirectToPengawasApp(['admin', 'pengawas'])).toBe(false)
        expect(shouldRedirectToPengawasApp(['manager', 'konsultan_pengawas'])).toBe(false)
        expect(shouldRedirectToPengawasApp(['admin', 'tfl'])).toBe(false)
    })

    it('does not redirect pure operator or empty roles', () => {
        expect(shouldRedirectToPengawasApp(['operator'])).toBe(false)
        expect(shouldRedirectToPengawasApp([])).toBe(false)
    })

    it('routes handoff through pengawasan login with one-time code', () => {
        expect(getPengawasAppUrl('abc|code')).toBe('/pengawasan/login?code=abc%7Ccode')
        expect(getPengawasAppUrl()).toBe('/pengawasan/')
    })
})
