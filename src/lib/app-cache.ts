export const BUILD_ID_STORAGE_KEY = 'arumanis-app-build-id'
export const DISMISSED_BUILD_ID_KEY = 'arumanis-dismissed-build-id'

let reloadInProgress = false

export function beginHardReload(): boolean {
    if (reloadInProgress) {
        return false
    }

    reloadInProgress = true
    return true
}

export type AppBuildInfo = {
    version: string
    buildId: string
    builtAt: string
}

const CHUNK_ERROR_PATTERNS = [
    'failed to fetch dynamically imported module',
    'importing a module script failed',
    'chunkloaderror',
    'loading chunk',
    'loading css chunk',
    'dynamically imported module',
]

export function getEmbeddedBuildInfo(): AppBuildInfo {
    // The build ID compiled into this JS bundle.
    // This is what tells us "which version of the code am I running right now".
    return {
        version: typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '0.0.0',
        buildId: typeof __APP_BUILD_ID__ !== 'undefined' ? __APP_BUILD_ID__ : 'dev',
        builtAt: '',
    }
}

/**
 * Reads the build info that was injected into the served index.html via <meta> tags.
 * This is the most up-to-date signal the server sent with this HTML document.
 * Useful for very early detection (before main bundle fully executes).
 */
export function getServedBuildInfoFromDOM(): AppBuildInfo | null {
    if (typeof document === 'undefined') return null

    const metaBuildId = document.querySelector<HTMLMetaElement>('meta[name="app-build-id"]')?.content
    if (!metaBuildId) return null

    return {
        version: document.querySelector<HTMLMetaElement>('meta[name="app-version"]')?.content || '0.0.0',
        buildId: metaBuildId,
        builtAt: document.querySelector<HTMLMetaElement>('meta[name="app-built-at"]')?.content || '',
    }
}

export function isChunkLoadError(error: unknown): boolean {
    const message = error instanceof Error
        ? `${error.name} ${error.message}`
        : String(error)

    const normalized = message.toLowerCase()
    return CHUNK_ERROR_PATTERNS.some((pattern) => normalized.includes(pattern))
}

export async function fetchRemoteBuildInfo(): Promise<AppBuildInfo | null> {
    try {
        // Multiple layers of cache busting:
        // - Unique query param
        // - cache: 'reload' tells browser to bypass HTTP cache
        // - no-cache headers as extra safety
        const url = `/version.json?_=${Date.now()}&v=${getEmbeddedBuildInfo().buildId}`
        const response = await fetch(url, {
            cache: 'reload',
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
            },
        })

        if (!response.ok) {
            return null
        }

        const data = await response.json() as Partial<AppBuildInfo>
        if (!data.buildId) {
            return null
        }

        return {
            version: data.version || '0.0.0',
            buildId: data.buildId,
            builtAt: data.builtAt || '',
        }
    } catch {
        return null
    }
}

export function hasNewBuildAvailable(
    embedded: AppBuildInfo,
    remote: AppBuildInfo,
): boolean {
    if (import.meta.env.DEV) {
        return false
    }

    if (!remote.buildId || remote.buildId === 'dev') {
        return false
    }

    return embedded.buildId !== remote.buildId
}

export function rememberBuildId(buildId: string): void {
    localStorage.setItem(BUILD_ID_STORAGE_KEY, buildId)
}

export function dismissBuildUpdate(buildId: string): void {
    localStorage.setItem(DISMISSED_BUILD_ID_KEY, buildId)
}

export function isBuildUpdateDismissed(buildId: string): boolean {
    return localStorage.getItem(DISMISSED_BUILD_ID_KEY) === buildId
}

export async function clearBrowserCaches(): Promise<void> {
    if ('caches' in window) {
        const cacheNames = await caches.keys()
        await Promise.all(cacheNames.map((name) => caches.delete(name)))
    }

    if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations()
        await Promise.all(registrations.map((registration) => registration.unregister()))
    }

    sessionStorage.clear()
}

export async function hardReloadApp(): Promise<void> {
    if (!beginHardReload()) {
        return
    }

    // 1. Clear all client-side storage we control
    await clearBrowserCaches()

    // 2. Try to force the browser to refetch the current document bypassing cache
    try {
        await fetch(window.location.href, { cache: 'reload', mode: 'same-origin' })
    } catch {
        // ignore network errors here
    }

    // 3. Do a hard navigation with a strong cache-buster query param.
    // Using href assignment + replace is more reliable than location.reload() across browsers.
    const url = new URL(window.location.href)
    url.searchParams.set('_cb', Date.now().toString(36))

    // Remove any old reload params to keep URL clean-ish
    url.searchParams.delete('_reload')

    // Force replace so back button doesn't go to stale version
    window.location.replace(url.toString())
}