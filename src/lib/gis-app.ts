const DEFAULT_GIS_APP_BASE_URL = '/gis'

function normalizeBaseUrl(value: string | undefined): string {
    const trimmed = value?.trim()
    if (!trimmed) {
        return DEFAULT_GIS_APP_BASE_URL
    }

    const withoutTrailingSlash = trimmed.replace(/\/+$/, '')
    return withoutTrailingSlash || DEFAULT_GIS_APP_BASE_URL
}

export function getGisAppBaseUrl(): string {
    return normalizeBaseUrl(import.meta.env.VITE_GIS_APP_BASE_URL)
}

/**
 * True only for the external GIS app mount (`/gis`, `/gis/...`).
 * Must NOT match portal routes like `/gis-lab`.
 */
export function isGisAppPathname(pathname: string): boolean {
    return pathname === '/gis' || pathname.startsWith('/gis/')
}

export function getGisAppUrl(handoffCode?: string): string {
    const baseUrl = getGisAppBaseUrl()

    if (!handoffCode) {
        return `${baseUrl}/`
    }

    return `${baseUrl}/login?code=${encodeURIComponent(handoffCode)}`
}
