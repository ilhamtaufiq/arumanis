export type UserGender = 'male' | 'female' | 'other'
export type AvatarPresetGender = 'male' | 'female'

export type AvatarPreset = {
    id: string
    gender: AvatarPresetGender
    label: string
    url: string
}

export type UserAvatarSource = {
    avatar?: string | null
    avatarUrl?: string | null
    name?: string | null
    email?: string | null
    id?: string | number | null
    seed?: string | null
    gender?: string | null
}

const AVATAR_PRESET_BASE = '/avatars/3d'

function preset(id: string, gender: AvatarPresetGender, label: string): AvatarPreset {
    return { id, gender, label, url: `${AVATAR_PRESET_BASE}/${id}.svg` }
}

/**
 * Avatar 3D bawaan (file statis di `public/avatars/3d`, dibuat oleh
 * `scripts/generate-avatars.mjs`). Disimpan ke kolom `avatar` sebagai path relatif.
 */
export const AVATAR_PRESETS: readonly AvatarPreset[] = [
    preset('male-01', 'male', 'Rambut pendek'),
    preset('male-02', 'male', 'Berpeci, seragam'),
    preset('male-03', 'male', 'Berkacamata'),
    preset('male-04', 'male', 'Berjanggut'),
    preset('male-05', 'male', 'Rambut keriting'),
    preset('male-06', 'male', 'Helm proyek'),
    preset('female-01', 'female', 'Hijab merah muda'),
    preset('female-02', 'female', 'Hijab navy, berkacamata'),
    preset('female-03', 'female', 'Hijab hijau sage'),
    preset('female-04', 'female', 'Hijab, seragam'),
    preset('female-05', 'female', 'Hijab krem'),
    preset('female-06', 'female', 'Hijab, helm proyek'),
]

export function normalizeAvatarPresetGender(gender?: string | null): AvatarPresetGender | null {
    const normalized = gender?.trim().toLowerCase()

    if (normalized === 'male' || normalized === 'female') {
        return normalized
    }

    return null
}

/** Preset untuk gender tertentu; tanpa gender → semua preset. */
export function getAvatarPresets(gender?: string | null): readonly AvatarPreset[] {
    const normalized = normalizeAvatarPresetGender(gender)
    return normalized ? AVATAR_PRESETS.filter((p) => p.gender === normalized) : AVATAR_PRESETS
}

export function findAvatarPreset(url?: string | null): AvatarPreset | null {
    const value = url?.trim()
    if (!value) {
        return null
    }

    let pathname = value
    try {
        pathname = new URL(value, 'http://localhost').pathname
    } catch {
        // biarkan apa adanya
    }

    return AVATAR_PRESETS.find((p) => p.url === pathname) ?? null
}

export function isAvatarPresetUrl(url?: string | null): boolean {
    return findAvatarPreset(url) !== null
}

/** Avatar DiceBear lama (sudah tidak dipakai) — diperlakukan sebagai kosong. */
export function isLegacyDicebearAvatarUrl(url?: string | null): boolean {
    if (!url?.trim()) {
        return false
    }

    try {
        return new URL(url.trim()).hostname === 'api.dicebear.com'
    } catch {
        return false
    }
}

function hashString(value: string): number {
    let hash = 0
    for (let i = 0; i < value.length; i++) {
        hash = (hash * 31 + value.charCodeAt(i)) | 0
    }
    return Math.abs(hash)
}

/** Preset default deterministik dari seed (id/email/nama) + gender. */
export function getDefaultAvatarPreset(seed: string, gender?: string | null): AvatarPreset {
    const pool = getAvatarPresets(gender)
    return pool[hashString(seed.trim() || 'anonymous') % pool.length]
}

export function hasUploadedAvatar(avatar?: string | null, avatarUrl?: string | null): boolean {
    return Boolean(avatar?.trim() || avatarUrl?.trim())
}

export function resolveUserAvatarSeed({
    seed,
    id,
    email,
    name,
}: Pick<UserAvatarSource, 'seed' | 'id' | 'email' | 'name'>): string {
    if (seed?.trim()) {
        return seed.trim()
    }

    if (id !== null && id !== undefined && String(id).trim() !== '') {
        return String(id)
    }

    if (email?.trim()) {
        return email.trim()
    }

    if (name?.trim()) {
        return name.trim()
    }

    return 'anonymous'
}

export function resolveUserAvatarUrl(source: UserAvatarSource = {}): string {
    const uploaded = source.avatarUrl?.trim()
    if (uploaded) {
        return uploaded
    }

    const stored = source.avatar?.trim()
    if (stored && !isLegacyDicebearAvatarUrl(stored)) {
        return stored
    }

    return getDefaultAvatarPreset(resolveUserAvatarSeed(source), source.gender).url
}

export function getUserAvatarFallbackInitials(name?: string | null): string {
    if (!name?.trim()) {
        return 'U'
    }

    const parts = name.trim().split(/\s+/).filter(Boolean)
    if (parts.length === 1) {
        return parts[0].slice(0, 2).toUpperCase()
    }

    return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase()
}

export function formatUserGenderLabel(gender?: string | null): string {
    switch (gender) {
        case 'male':
            return 'Laki-laki'
        case 'female':
            return 'Perempuan'
        case 'other':
            return 'Lainnya'
        default:
            return 'Belum diisi'
    }
}