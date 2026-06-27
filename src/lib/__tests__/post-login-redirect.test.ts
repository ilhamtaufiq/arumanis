import { describe, expect, it } from 'vitest'
import {
    isAllowedPublicRedirect,
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
    })

    it('sends public users to publikasi by default', () => {
        expect(resolvePostLoginPath(['user'])).toBe('/publikasi')
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
})