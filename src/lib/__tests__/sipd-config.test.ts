import { describe, expect, it } from 'vitest'
import { resolveSipdBaseUrl, SIPD_LOCAL_URL, SIPD_PRODUCTION_URL } from '@/lib/sipd-config'

describe('resolveSipdBaseUrl', () => {
    it('uses configured URL when provided', () => {
        expect(resolveSipdBaseUrl({
            configuredUrl: 'https://custom.example/',
            isProduction: true,
        })).toBe('https://custom.example')
    })

    it('defaults to production SIPD host in production', () => {
        expect(resolveSipdBaseUrl({ isProduction: true })).toBe(SIPD_PRODUCTION_URL)
    })

    it('defaults to localhost in development', () => {
        expect(resolveSipdBaseUrl({ isProduction: false })).toBe(SIPD_LOCAL_URL)
    })
})