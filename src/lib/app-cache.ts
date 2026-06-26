export const BUILD_ID_STORAGE_KEY = 'arumanis-app-build-id'
export const DISMISSED_BUILD_ID_KEY = 'arumanis-dismissed-build-id'
export const RELOAD_PENDING_KEY = 'arumanis-reload-pending'
export const RELOAD_LOCK_KEY = 'arumanis-reload-lock'
export const RELOAD_ATTEMPT_KEY = 'arumanis-reload-attempt'

const RELOAD_LOCK_TTL_MS = 12_000
export const MAX_AUTO_RELOAD_ATTEMPTS = 3

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
    'unable to preload css',
    'outdated optimize dep',
]

const ASSET_ERROR_PATTERNS = [
    ...CHUNK_ERROR_PATTERNS,
    'mime type',
    'module script',
    'stylesheet',
    'text/html', // server returned HTML instead of JS (stale asset path)
]

export function getEmbeddedBuildInfo(): AppBuildInfo {
    return {
        version: typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '0.0.0',
        buildId: typeof __APP_BUILD_ID__ !== 'undefined' ? __APP_BUILD_ID__ : 'dev',
        builtAt: '',
    }
}

/**
 * Reads the build info that was injected into the served index.html via <meta> tags.
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
    return matchesErrorPatterns(error, CHUNK_ERROR_PATTERNS)
}

export function isAssetLoadError(error: unknown): boolean {
    return matchesErrorPatterns(error, ASSET_ERROR_PATTERNS)
}

function matchesErrorPatterns(error: unknown, patterns: string[]): boolean {
    const message = error instanceof Error
        ? `${error.name} ${error.message}`
        : String(error)

    const normalized = message.toLowerCase()
    return patterns.some((pattern) => normalized.includes(pattern))
}

export function isReloadPending(): boolean {
    if (typeof sessionStorage === 'undefined') {
        return false
    }

    return sessionStorage.getItem(RELOAD_PENDING_KEY) === '1'
}

export function markReloadPending(): void {
    sessionStorage.setItem(RELOAD_PENDING_KEY, '1')
}

export function clearReloadPending(): void {
    sessionStorage.removeItem(RELOAD_PENDING_KEY)
}

export function getReloadAttemptCount(): number {
    return Number(sessionStorage.getItem(RELOAD_ATTEMPT_KEY) || '0')
}

export function incrementReloadAttempt(): number {
    const next = getReloadAttemptCount() + 1
    sessionStorage.setItem(RELOAD_ATTEMPT_KEY, String(next))
    return next
}

export function clearReloadAttemptState(): void {
    sessionStorage.removeItem(RELOAD_ATTEMPT_KEY)
    sessionStorage.removeItem(RELOAD_LOCK_KEY)
    clearReloadPending()
}

export function beginHardReload(): boolean {
    const lockValue = sessionStorage.getItem(RELOAD_LOCK_KEY)
    if (lockValue) {
        const lockTime = Number(lockValue)
        if (Number.isFinite(lockTime) && Date.now() - lockTime < RELOAD_LOCK_TTL_MS) {
            return false
        }
    }

    sessionStorage.setItem(RELOAD_LOCK_KEY, String(Date.now()))
    return true
}

export async function fetchRemoteBuildInfo(): Promise<AppBuildInfo | null> {
    try {
        const url = `/version.json?_=${Date.now()}&v=${getEmbeddedBuildInfo().buildId}`
        const response = await fetch(url, {
            cache: 'reload',
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                Pragma: 'no-cache',
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

export function isValidBuildId(buildId: string | undefined | null): buildId is string {
    return Boolean(buildId && buildId !== 'dev')
}

export function rememberBuildId(buildId: string): void {
    if (!isValidBuildId(buildId)) {
        return
    }

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

    Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith('retry-lazy-refreshed-')) {
            sessionStorage.removeItem(key)
        }
    })
}

function buildCacheBustedUrl(): string {
    const url = new URL(window.location.href)
    url.searchParams.set('_cb', Date.now().toString(36))
    url.searchParams.delete('_reload')
    return url.toString()
}

export async function hardReloadApp(options?: { force?: boolean }): Promise<boolean> {
    const force = options?.force === true

    if (force) {
        sessionStorage.removeItem(RELOAD_ATTEMPT_KEY)
        sessionStorage.removeItem(RELOAD_LOCK_KEY)
    }

    if (!force && getReloadAttemptCount() >= MAX_AUTO_RELOAD_ATTEMPTS) {
        clearReloadPending()
        return false
    }

    if (!beginHardReload()) {
        return false
    }

    markReloadPending()
    incrementReloadAttempt()

    await clearBrowserCaches()

    try {
        await fetch(window.location.href, { cache: 'reload', mode: 'same-origin' })
    } catch {
        // ignore network errors here
    }

    const targetUrl = buildCacheBustedUrl()

    window.setTimeout(() => {
        window.location.replace(targetUrl)
    }, 0)

    window.setTimeout(() => {
        window.location.href = targetUrl
    }, 1500)

    return true
}

export async function handleStaleAppError(error: unknown, options?: { force?: boolean }): Promise<boolean> {
    if (!isAssetLoadError(error)) {
        return false
    }

    return hardReloadApp(options)
}