import { describe, expect, it } from 'vitest'
import { getPublicMessages, publicMessages } from '../messages'
import { isPublicLocale } from '../use-public-locale'

describe('public i18n messages', () => {
    it('returns indonesian messages by default', () => {
        expect(getPublicMessages('id').landing.nav.signIn).toBe('Masuk')
    })

    it('returns english messages', () => {
        expect(getPublicMessages('en').landing.nav.signIn).toBe('Sign In')
    })

    it('keeps Air Minum dan Sanitasi nomenclature in english locale', () => {
        expect(getPublicMessages('en').landing.hero.title).toBe('Air Minum dan Sanitasi.')
        expect(getPublicMessages('en').legal.subtitle).toBe('Air Minum & Sanitasi Cianjur')
    })

    it('has matching structure for both locales', () => {
        expect(Object.keys(publicMessages.id.landing.nav)).toEqual(
            Object.keys(publicMessages.en.landing.nav),
        )
    })

    it('validates locale values', () => {
        expect(isPublicLocale('id')).toBe(true)
        expect(isPublicLocale('en')).toBe(true)
        expect(isPublicLocale('fr')).toBe(false)
    })
})