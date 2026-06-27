import { normalizeRoleNames, normalizeRoleSlug } from '@/lib/pengawas-app'

const STAFF_ROLE_SLUGS = new Set([
    'admin',
    'tfl',
    'pengawas',
    'konsultan_pengawas',
    'manager',
])

export const POST_LOGIN_REDIRECT_KEY = 'arumanis_post_login_redirect'

const PUBLIC_REDIRECT_PREFIXES = [
    '/publikasi',
    '/privacy-policy',
    '/terms',
    '/rancang-bangun-inovasi',
    '/tujuan-manfaat-hasil',
    '/puspen',
]

export function isPublicOnlyUser(roles: unknown): boolean {
    const names = normalizeRoleNames(roles)
    if (names.length === 0) {
        return true
    }

    return !names.some((role) => STAFF_ROLE_SLUGS.has(normalizeRoleSlug(role)))
}

export function isAllowedPublicRedirect(path: string | undefined): path is string {
    if (!path || !path.startsWith('/')) {
        return false
    }

    if (path.startsWith('/sign-in') || path.startsWith('/oauth-callback')) {
        return false
    }

    if (path === '/') {
        return true
    }

    return PUBLIC_REDIRECT_PREFIXES.some(
        (prefix) => path === prefix || path.startsWith(`${prefix}/`),
    )
}

export function resolvePostLoginPath(roles: unknown, redirectTo?: string): string {
    if (!isPublicOnlyUser(roles)) {
        if (redirectTo && !redirectTo.startsWith('/sign-in')) {
            return redirectTo
        }

        return '/dashboard'
    }

    if (isAllowedPublicRedirect(redirectTo)) {
        return redirectTo
    }

    return '/'
}

export function storePostLoginRedirect(path?: string) {
    if (!path || typeof window === 'undefined') {
        return
    }

    sessionStorage.setItem(POST_LOGIN_REDIRECT_KEY, path)
}

export function consumePostLoginRedirect(): string | undefined {
    if (typeof window === 'undefined') {
        return undefined
    }

    const value = sessionStorage.getItem(POST_LOGIN_REDIRECT_KEY) || undefined
    sessionStorage.removeItem(POST_LOGIN_REDIRECT_KEY)

    return value
}