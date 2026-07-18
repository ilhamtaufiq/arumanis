import { describe, expect, it } from 'vitest'
import {
    buildSpseBookmarkletHref,
    buildSpseCookieHeader,
    extractSpseSessionValue,
    normalizeSpseSessionValueInput,
    readSpseSessionFromSearchParams,
    resolveSpseReturnUrl,
} from '../spse-session'

describe('buildSpseCookieHeader', () => {
    it('wraps bare value with SPSE_SESSION=', () => {
        expect(buildSpseCookieHeader('temp|abc123')).toBe('SPSE_SESSION=temp|abc123')
    })

    it('keeps named cookie as-is', () => {
        expect(buildSpseCookieHeader('SPSE_SESSION=temp|abc123')).toBe('SPSE_SESSION=temp|abc123')
    })

    it('keeps full cookie header as-is', () => {
        const header = 'SPSE_SESSION=a; XSRF-TOKEN=b'
        expect(buildSpseCookieHeader(header)).toBe(header)
    })

    it('returns empty for blank input', () => {
        expect(buildSpseCookieHeader('   ')).toBe('')
    })
})

describe('normalizeSpseSessionValueInput', () => {
    it('strips SPSE_SESSION= prefix from single cookie paste', () => {
        expect(normalizeSpseSessionValueInput('SPSE_SESSION=temp|xyz')).toBe('temp|xyz')
    })

    it('keeps full multi-cookie header for advanced paste', () => {
        const header = 'SPSE_SESSION=a; XSRF-TOKEN=b'
        expect(normalizeSpseSessionValueInput(header)).toBe(header)
    })

    it('keeps bare value', () => {
        expect(normalizeSpseSessionValueInput('temp|xyz')).toBe('temp|xyz')
    })
})

describe('extractSpseSessionValue', () => {
    it('extracts from multi-cookie header', () => {
        expect(extractSpseSessionValue('foo=1; SPSE_SESSION=secret; bar=2')).toBe('secret')
    })

    it('returns null when missing', () => {
        expect(extractSpseSessionValue('XSRF-TOKEN=abc')).toBeNull()
    })
})

describe('readSpseSessionFromSearchParams', () => {
    it('prefers spse_session', () => {
        expect(
            readSpseSessionFromSearchParams({
                spse_session: 'val',
                spse_cookie: 'SPSE_SESSION=other',
            }),
        ).toEqual({ input: 'val', source: 'spse_session' })
    })

    it('falls back to spse_cookie', () => {
        expect(readSpseSessionFromSearchParams({ spse_cookie: 'SPSE_SESSION=x' })).toEqual({
            input: 'SPSE_SESSION=x',
            source: 'spse_cookie',
        })
    })

    it('reads URLSearchParams', () => {
        const params = new URLSearchParams('spse_session=from-query')
        expect(readSpseSessionFromSearchParams(params)).toEqual({
            input: 'from-query',
            source: 'spse_session',
        })
    })

    it('returns null when empty', () => {
        expect(readSpseSessionFromSearchParams({})).toBeNull()
    })
})

describe('bookmarklet helpers', () => {
    it('resolves return URL without trailing slash', () => {
        expect(resolveSpseReturnUrl('https://app.example/', '/procurement-sync/')).toBe(
            'https://app.example/procurement-sync',
        )
    })

    it('builds javascript bookmarklet with return URL and cookie match', () => {
        const href = buildSpseBookmarkletHref('https://app.example/procurement-sync')
        expect(href.startsWith('javascript:')).toBe(true)
        expect(href).toContain('SPSE_SESSION')
        expect(href).toContain('https://app.example/procurement-sync')
        expect(href).toContain('spse_session=')
        expect(href).toContain('inaproc')
    })
})
