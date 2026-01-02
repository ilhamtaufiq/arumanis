import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { getCookie, setCookie, removeCookie } from '../cookies'

describe('cookies', () => {
    beforeEach(() => {
        // Clear cookies before each test
        document.cookie.split(';').forEach((c) => {
            document.cookie = c
                .replace(/^ +/, '')
                .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`)
        })
    })

    it('should set and get a cookie', () => {
        setCookie('test-cookie', 'test-value')
        expect(getCookie('test-cookie')).toBe('test-value')
    })

    it('should return undefined for non-existent cookie', () => {
        expect(getCookie('non-existent')).toBeUndefined()
    })

    it('should remove a cookie', () => {
        setCookie('test-cookie', 'test-value')
        expect(getCookie('test-cookie')).toBe('test-value')
        removeCookie('test-cookie')
        expect(getCookie('test-cookie')).toBeUndefined()
    })

    it('should handle cookie with max age', () => {
        setCookie('timeout-cookie', 'value', 3600)
        expect(getCookie('timeout-cookie')).toBe('value')
    })
})
