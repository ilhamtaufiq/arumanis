const DEFAULT_PENGAWAS_APP_BASE_URL = '/pengawasan'

const PENGAWAS_APP_ROLE_SLUGS = new Set(['pengawas', 'pengawasan', 'konsultan_pengawas'])

function normalizeBaseUrl(value: string | undefined): string {
    const trimmed = value?.trim()
    if (!trimmed) {
        return DEFAULT_PENGAWAS_APP_BASE_URL
    }

    const withoutTrailingSlash = trimmed.replace(/\/+$/, '')
    return withoutTrailingSlash || DEFAULT_PENGAWAS_APP_BASE_URL
}

export function normalizeRoleSlug(roleName: string): string {
    return roleName.toLowerCase().trim().replace(/\s+/g, '_')
}

export function normalizeRoleNames(roles: unknown): string[] {
    if (!Array.isArray(roles)) {
        return []
    }

    return roles
        .map((role) => {
            if (typeof role === 'string') {
                return role
            }

            if (role && typeof role === 'object' && typeof (role as { name?: unknown }).name === 'string') {
                return (role as { name: string }).name
            }

            return ''
        })
        .filter((name): name is string => Boolean(name))
}

function isPengawasAppRoleName(roleName: string): boolean {
    return PENGAWAS_APP_ROLE_SLUGS.has(normalizeRoleSlug(roleName))
}

export function isPengawasUser(roles: unknown): boolean {
    return normalizeRoleNames(roles).some(isPengawasAppRoleName)
}

export function getPengawasAppBaseUrl(): string {
    return normalizeBaseUrl(import.meta.env.VITE_PENGAWAS_APP_BASE_URL)
}

export function getPengawasAppUrl(handoffCode?: string): string {
    const baseUrl = getPengawasAppBaseUrl()

    if (!handoffCode) {
        return `${baseUrl}/`
    }

    return `${baseUrl}/login?code=${encodeURIComponent(handoffCode)}`
}

export function shouldRedirectToPengawasApp(roles: unknown): boolean {
    const names = normalizeRoleNames(roles)
    if (!names.length || !isPengawasUser(names)) {
        return false
    }

    const slugs = names.map(normalizeRoleSlug)
    return !slugs.includes('admin') && !slugs.includes('manager')
}