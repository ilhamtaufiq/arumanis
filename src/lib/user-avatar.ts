const DICEBEAR_PIXEL_ART_STYLE = 'pixel-art'
const DICEBEAR_API_VERSION = '9.x'

export type UserGender = 'male' | 'female' | 'other'
export type DicebearGender = 'male' | 'female'

export type UserAvatarSource = {
    avatar?: string | null
    avatarUrl?: string | null
    name?: string | null
    email?: string | null
    id?: string | number | null
    seed?: string | null
    gender?: string | null
}

export function normalizeDicebearGender(gender?: string | null): DicebearGender | null {
    const normalized = gender?.trim().toLowerCase()

    if (normalized === 'male' || normalized === 'female') {
        return normalized
    }

    return null
}

export function isDicebearAvatarUrl(url?: string | null): boolean {
    if (!url?.trim()) {
        return false
    }

    try {
        const parsed = new URL(url.trim())
        return (
            parsed.hostname === 'api.dicebear.com' &&
            parsed.pathname.includes(`/${DICEBEAR_PIXEL_ART_STYLE}/`)
        )
    } catch {
        return false
    }
}

export function extractDicebearSeedFromUrl(url: string): string | null {
    try {
        return new URL(url.trim()).searchParams.get('seed')
    } catch {
        return null
    }
}

export function createRandomAvatarSeed(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID()
    }

    return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function createRandomDicebearAvatarUrl(gender?: string | null, seed?: string): string {
    return getDicebearAvatarUrl(seed ?? createRandomAvatarSeed(), gender)
}

export function updateDicebearAvatarGender(url: string, gender?: string | null): string {
    const seed = extractDicebearSeedFromUrl(url)
    if (!seed) {
        return url
    }

    return getDicebearAvatarUrl(seed, gender)
}

export function getDicebearAvatarUrl(seed: string, gender?: string | null): string {
    const normalizedSeed = seed.trim() || 'anonymous'
    const params = new URLSearchParams({ seed: normalizedSeed })
    const dicebearGender = normalizeDicebearGender(gender)

    if (dicebearGender) {
        params.set('gender', dicebearGender)
    }

    return `https://api.dicebear.com/${DICEBEAR_API_VERSION}/${DICEBEAR_PIXEL_ART_STYLE}/svg?${params.toString()}`
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
    const uploaded = source.avatar?.trim() || source.avatarUrl?.trim()
    if (uploaded) {
        return uploaded
    }

    return getDicebearAvatarUrl(resolveUserAvatarSeed(source), source.gender)
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