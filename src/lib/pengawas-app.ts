const DEFAULT_PENGAWAS_APP_BASE_URL = '/pengawasan'

function normalizeBaseUrl(value: string | undefined): string {
    const trimmed = value?.trim()
    if (!trimmed) {
        return DEFAULT_PENGAWAS_APP_BASE_URL
    }

    const withoutTrailingSlash = trimmed.replace(/\/+$/, '')
    return withoutTrailingSlash || DEFAULT_PENGAWAS_APP_BASE_URL
}

function isPengawasRoleName(role: unknown): boolean {
    if (typeof role === 'string') {
        const normalized = role.toLowerCase()
        return normalized === 'pengawas' || normalized === 'pengawasan'
    }

    if (!role || typeof role !== 'object') {
        return false
    }

    const name = (role as { name?: unknown }).name
    if (typeof name !== 'string') {
        return false
    }

    const normalized = name.toLowerCase()
    return normalized === 'pengawas' || normalized === 'pengawasan'
}

export function isPengawasUser(roles: unknown): boolean {
    return Array.isArray(roles) && roles.some(isPengawasRoleName)
}

export function getPengawasAppBaseUrl(): string {
    return normalizeBaseUrl(import.meta.env.VITE_PENGAWAS_APP_BASE_URL)
}

export function getPengawasAppUrl(token?: string): string {
    const baseUrl = getPengawasAppBaseUrl()
    const tokenQuery = token ? `?token=${encodeURIComponent(token)}` : ''
    return `${baseUrl}/${tokenQuery}`
}

export function shouldRedirectToPengawasApp(roles: string[] | undefined | null): boolean {
    if (!roles?.length || !isPengawasUser(roles)) {
        return false
    }

    return !roles.includes('admin') && !roles.includes('manager')
}
