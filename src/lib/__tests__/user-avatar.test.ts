import { describe, expect, it } from 'vitest'
import {
    AVATAR_PRESETS,
    findAvatarPreset,
    getAvatarPresets,
    getDefaultAvatarPreset,
    hasUploadedAvatar,
    isAvatarPresetUrl,
    isLegacyDicebearAvatarUrl,
    normalizeAvatarPresetGender,
    resolveUserAvatarSeed,
    resolveUserAvatarUrl,
} from '../user-avatar'

describe('user-avatar', () => {
    it('exposes male and female (hijab) presets', () => {
        expect(getAvatarPresets('male').length).toBeGreaterThan(0)
        expect(getAvatarPresets('female').length).toBeGreaterThan(0)
        expect(getAvatarPresets('male').every((p) => p.gender === 'male')).toBe(true)
        expect(getAvatarPresets(null)).toHaveLength(AVATAR_PRESETS.length)
        expect(AVATAR_PRESETS.every((p) => p.url.startsWith('/avatars/3d/'))).toBe(true)
    })

    it('prefers uploaded file over stored avatar', () => {
        const url = resolveUserAvatarUrl({
            avatar: '/avatars/3d/male-01.svg',
            avatarUrl: 'https://cdn.example.com/me.jpg',
            name: 'Budi',
        })

        expect(url).toBe('https://cdn.example.com/me.jpg')
    })

    it('uses stored avatar (preset or external url)', () => {
        expect(resolveUserAvatarUrl({ avatar: '/avatars/3d/female-02.svg' })).toBe('/avatars/3d/female-02.svg')
        expect(resolveUserAvatarUrl({ avatar: 'https://lh3.googleusercontent.com/a/x' })).toBe(
            'https://lh3.googleusercontent.com/a/x',
        )
    })

    it('falls back to deterministic gendered preset when avatar is empty', () => {
        const a = resolveUserAvatarUrl({ avatar: '   ', id: 42, gender: 'female' })
        const b = resolveUserAvatarUrl({ id: 42, gender: 'female' })

        expect(a).toBe(b)
        expect(findAvatarPreset(a)?.gender).toBe('female')
    })

    it('ignores legacy dicebear avatars', () => {
        const legacy = 'https://api.dicebear.com/9.x/pixel-art/svg?seed=abc&gender=male'

        expect(isLegacyDicebearAvatarUrl(legacy)).toBe(true)
        expect(isLegacyDicebearAvatarUrl('/avatars/3d/male-01.svg')).toBe(false)
        const url = resolveUserAvatarUrl({ avatar: legacy, id: 7, gender: 'male' })
        expect(findAvatarPreset(url)?.gender).toBe('male')
    })

    it('detects preset urls, including absolute ones', () => {
        expect(isAvatarPresetUrl('/avatars/3d/male-03.svg')).toBe(true)
        expect(findAvatarPreset('https://arumanis.example/avatars/3d/female-01.svg')?.id).toBe('female-01')
        expect(isAvatarPresetUrl('https://cdn.example.com/me.jpg')).toBe(false)
        expect(isAvatarPresetUrl(null)).toBe(false)
    })

    it('default preset is stable per seed', () => {
        expect(getDefaultAvatarPreset('seed-1', 'male')).toEqual(getDefaultAvatarPreset('seed-1', 'male'))
        expect(getDefaultAvatarPreset('', 'other')).toBeDefined()
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

    it('normalizes gender for presets', () => {
        expect(normalizeAvatarPresetGender('male')).toBe('male')
        expect(normalizeAvatarPresetGender('Female')).toBe('female')
        expect(normalizeAvatarPresetGender('other')).toBeNull()
        expect(normalizeAvatarPresetGender(null)).toBeNull()
    })
})
