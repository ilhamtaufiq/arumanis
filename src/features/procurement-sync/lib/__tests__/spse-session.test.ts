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

    it('bookmarklet body is syntactically valid JS (drag-to-bookmark must execute)', () => {
        const href = buildSpseBookmarkletHref('https://app.example/procurement-sync')
        const body = href.replace(/^javascript:/, '')
        // Must not be React's blocked-URL placeholder
        expect(body).not.toContain('React has blocked')
        expect(() => new Function(body)).not.toThrow()
    })

    describe('bookmarklet runtime', () => {
        function runBookmarklet(hostname: string, cookie: string) {
            const href = buildSpseBookmarkletHref('https://app.example/procurement-sync')
            const body = href.replace(/^javascript:/, '')
            // Bookmarklet body references bare location/document/alert globals
            const fn = new Function('location', 'document', 'alert', body)
            let redirected = ''
            let alerted = ''
            const location = {
                hostname,
                set href(v: string) {
                    redirected = v
                },
            }
            fn(location, { cookie }, (m: string) => {
                alerted = m
            })
            return { redirected, alerted }
        }

        it('redirects with spse_session when cookie readable', () => {
            const { redirected, alerted } = runBookmarklet(
                'spse.inaproc.id',
                'a=1; SPSE_SESSION=temp|abc123; b=2',
            )
            expect(alerted).toBe('')
            expect(redirected).toContain('?spse_session=temp%7Cabc123')
        })

        it('redirects with spse_diagnose when SPSE_SESSION unreadable (HttpOnly)', () => {
            const { redirected, alerted } = runBookmarklet('spse.inaproc.id', 'foo=1; bar=2')
            expect(alerted).toBe('')
            expect(redirected).toContain('?spse_diagnose=foo%2Cbar')
        })

        it('redirects with empty spse_diagnose when no cookie visible at all', () => {
            const { redirected } = runBookmarklet('spse.inaproc.id', '')
            expect(redirected).toContain('?spse_diagnose=')
        })

        it('alerts when clicked outside SPSE host', () => {
            const { redirected, alerted } = runBookmarklet('example.com', '')
            expect(redirected).toBe('')
            expect(alerted).toContain('spse.inaproc.id')
        })
    })
})
