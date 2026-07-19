const DEFAULT_PENGAWAS_APP_BASE_URL = '/pengawasan'

/** Lapangan: pengawas, konsultan_pengawas, tfl (setara) */
const PENGAWAS_APP_ROLE_SLUGS = new Set(['pengawas', 'pengawasan', 'konsultan_pengawas', 'tfl'])
const PORTAL_OPERATOR_ROLE_SLUGS = new Set(['operator'])
const PORTAL_STAFF_BYPASS_SLUGS = new Set(['admin', 'manager'])

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

function isOperatorRoleName(roleName: string): boolean {
    return PORTAL_OPERATOR_ROLE_SLUGS.has(normalizeRoleSlug(roleName))
}

export function isPengawasUser(roles: unknown): boolean {
    return normalizeRoleNames(roles).some(isPengawasAppRoleName)
}

export function isOperatorUser(roles: unknown): boolean {
    return normalizeRoleNames(roles).some(isOperatorRoleName)
}

/**
 * User has both portal operator access and pengawasan field access.
 * After login they should choose which app to open.
 */
export function needsDashboardDestinationChoice(roles: unknown): boolean {
    const names = normalizeRoleNames(roles)
    if (!names.length) {
        return false
    }

    const slugs = names.map(normalizeRoleSlug)
    if (slugs.some((slug) => PORTAL_STAFF_BYPASS_SLUGS.has(slug))) {
        return false
    }

    return isOperatorUser(slugs) && isPengawasUser(slugs)
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

/**
 * Auto-redirect to pengawasan only when user is pure pengawas
 * (not admin/manager, and not dual operator+pengawas who need a choice modal).
 */
export function shouldRedirectToPengawasApp(roles: unknown): boolean {
    const names = normalizeRoleNames(roles)
    if (!names.length || !isPengawasUser(names)) {
        return false
    }

    if (needsDashboardDestinationChoice(names)) {
        return false
    }

    const slugs = names.map(normalizeRoleSlug)
    return !slugs.some((slug) => PORTAL_STAFF_BYPASS_SLUGS.has(slug))
}
