import { describe, expect, it } from 'vitest'
import {
    createRandomDicebearAvatarUrl,
    getDicebearAvatarUrl,
    hasUploadedAvatar,
    isDicebearAvatarUrl,
    normalizeDicebearGender,
    resolveUserAvatarSeed,
    resolveUserAvatarUrl,
    updateDicebearAvatarGender,
} from '../user-avatar'

describe('user-avatar', () => {
    it('builds dicebear pixel-art url from seed', () => {
        const url = getDicebearAvatarUrl('Budi Santoso')

        expect(url).toContain('api.dicebear.com/9.x/pixel-art/svg')
        expect(new URL(url).searchParams.get('seed')).toBe('Budi Santoso')
    })

    it('prefers uploaded avatar over dicebear', () => {
        const url = resolveUserAvatarUrl({
            avatar: 'https://cdn.example.com/me.jpg',
            name: 'Budi',
        })

        expect(url).toBe('https://cdn.example.com/me.jpg')
    })

    it('falls back to dicebear when avatar is empty', () => {
        const url = resolveUserAvatarUrl({
            avatar: '   ',
            id: 42,
            name: 'Budi',
        })

        expect(url).toContain('seed=42')
    })

    it('resolves seed priority seed > id > email > name', () => {
        expect(resolveUserAvatarSeed({ seed: 'custom', id: 1, email: 'a@b.com', name: 'A' })).toBe('custom')
        expect(resolveUserAvatarSeed({ id: 1, email: 'a@b.com', name: 'A' })).toBe('1')
        expect(resolveUserAvatarSeed({ email: 'a@b.com', name: 'A' })).toBe('a@b.com')
        expect(resolveUserAvatarSeed({ name: 'A' })).toBe('A')
    })

    it('detects uploaded avatar', () => {
        expect(hasUploadedAvatar('https://cdn.example.com/a.jpg')).toBe(true)
        expect(hasUploadedAvatar(null, 'https://cdn.example.com/a.jpg')).toBe(true)
        expect(hasUploadedAvatar('')).toBe(false)
    })

    it('appends dicebear gender when provided', () => {
        const url = getDicebearAvatarUrl('Budi', 'female')

        expect(new URL(url).searchParams.get('gender')).toBe('female')
    })

    it('normalizes gender for dicebear', () => {
        expect(normalizeDicebearGender('male')).toBe('male')
        expect(normalizeDicebearGender('Female')).toBe('female')
        expect(normalizeDicebearGender('other')).toBeNull()
        expect(normalizeDicebearGender(null)).toBeNull()
    })

    it('uses gender in dicebear fallback url', () => {
        const url = resolveUserAvatarUrl({
            id: 7,
            name: 'Ani',
            gender: 'female',
        })

        expect(url).toContain('seed=7')
        expect(new URL(url).searchParams.get('gender')).toBe('female')
    })

    it('detects dicebear avatar urls', () => {
        expect(isDicebearAvatarUrl(getDicebearAvatarUrl('test-seed'))).toBe(true)
        expect(isDicebearAvatarUrl('https://cdn.example.com/me.jpg')).toBe(false)
        expect(isDicebearAvatarUrl(null)).toBe(false)
    })

    it('creates random dicebear avatar with explicit seed', () => {
        const url = createRandomDicebearAvatarUrl('male', 'random-seed-123')

        expect(isDicebearAvatarUrl(url)).toBe(true)
        expect(new URL(url).searchParams.get('seed')).toBe('random-seed-123')
        expect(new URL(url).searchParams.get('gender')).toBe('male')
    })

    it('updates dicebear avatar gender while keeping seed', () => {
        const original = getDicebearAvatarUrl('stable-seed', 'male')
        const updated = updateDicebearAvatarGender(original, 'female')

        expect(new URL(updated).searchParams.get('seed')).toBe('stable-seed')
        expect(new URL(updated).searchParams.get('gender')).toBe('female')
    })
})