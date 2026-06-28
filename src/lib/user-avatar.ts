const DICEBEAR_PIXEL_ART_STYLE = 'pixel-art'
const DICEBEAR_API_VERSION = '9.x'

export type UserAvatarSource = {
    avatar?: string | null
    avatarUrl?: string | null
    name?: string | null
    email?: string | null
    id?: string | number | null
    seed?: string | null
}

export function getDicebearAvatarUrl(seed: string): string {
    const normalizedSeed = seed.trim() || 'anonymous'
    const params = new URLSearchParams({ seed: normalizedSeed })

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

    return getDicebearAvatarUrl(resolveUserAvatarSeed(source))
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