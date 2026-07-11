const DEFAULT_BYPASS_EMAILS = ['ilhamtaufiq@gmail.com']

export type MaintenanceStatus = {
    enabled: boolean
    bypass: boolean
    can_access: boolean
    message?: string | null
}

export function parseBypassEmails(raw: string | null | undefined): string[] {
    if (!raw?.trim()) return [...DEFAULT_BYPASS_EMAILS]
    const list = raw
        .split(/[,;\s]+/)
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean)
    return list.length > 0 ? list : [...DEFAULT_BYPASS_EMAILS]
}

export function isMaintenanceBypassEmail(
    email: string | null | undefined,
    bypassList?: string[],
): boolean {
    if (!email) return false
    const list = bypassList?.length ? bypassList : DEFAULT_BYPASS_EMAILS
    return list.includes(email.trim().toLowerCase())
}

/** Routes still reachable while maintenance is on (so bypass admin can log in). */
export function isMaintenanceExemptPath(pathname: string): boolean {
    const path = pathname.replace(/\/+$/, '') || '/'
    if (path === '/sign-in' || path.startsWith('/sign-in/')) return true
    if (path === '/oauth-callback' || path.startsWith('/oauth-callback')) return true
    if (path === '/maintenance' || path.startsWith('/maintenance/')) return true
    return false
}
