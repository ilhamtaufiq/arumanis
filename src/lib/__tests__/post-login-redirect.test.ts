import { describe, expect, it } from 'vitest'
import {
    buildExternalAppCallbackUrl,
    isAllowedPublicRedirect,
    isExternalRedirectUrl,
    isPublicOnlyUser,
    resolvePostLoginPath,
} from '@/lib/post-login-redirect'

describe('post-login-redirect', () => {
    it('treats user-only accounts as public', () => {
        expect(isPublicOnlyUser(['user'])).toBe(true)
        expect(isPublicOnlyUser([{ name: 'user' }])).toBe(true)
    })

    it('treats staff roles as non-public', () => {
        expect(isPublicOnlyUser(['admin'])).toBe(false)
        expect(isPublicOnlyUser(['user', 'tfl'])).toBe(false)
        expect(isPublicOnlyUser(['operator'])).toBe(false)
        expect(isPublicOnlyUser(['operator', 'pengawas'])).toBe(false)
    })

    it('sends public users to landing by default', () => {
        expect(resolvePostLoginPath(['user'])).toBe('/')
    })

    it('honors publikasi redirect for public users', () => {
        expect(resolvePostLoginPath(['user'], '/publikasi/artikel-test')).toBe('/publikasi/artikel-test')
    })

    it('sends staff users to dashboard by default', () => {
        expect(resolvePostLoginPath(['admin'])).toBe('/dashboard')
    })

    it('allows safe public redirect targets', () => {
        expect(isAllowedPublicRedirect('/publikasi/slug')).toBe(true)
        expect(isAllowedPublicRedirect('/dashboard')).toBe(false)
    })

    it('detects external redirect URLs', () => {
        expect(isExternalRedirectUrl('https://sipd-lite.cianjur.space/dashboard')).toBe(true)
        expect(isExternalRedirectUrl('/dashboard')).toBe(false)
    })

    it('builds external callback URL with handoff code', () => {
        const callback = buildExternalAppCallbackUrl(
            'https://sipd-lite.cianjur.space/dashboard',
            'a'.repeat(48),
        )
        const url = new URL(callback)
        expect(url.origin).toBe('https://sipd-lite.cianjur.space')
        expect(url.pathname).toBe('/auth/callback')
        expect(url.searchParams.get('redirect')).toBe('/dashboard')
        expect(url.searchParams.get('code')).toBe('a'.repeat(48))
    })
})