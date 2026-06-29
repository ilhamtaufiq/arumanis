export type UmamiConfig = {
    scriptUrl: string
    websiteId: string
    domains?: string
}

declare global {
    interface Window {
        umami?: {
            track: (
                event?: string | ((props: Record<string, unknown>) => Record<string, unknown>),
                eventData?: Record<string, unknown>
            ) => void
        }
    }
}

let scriptLoadPromise: Promise<void> | null = null

export function getUmamiConfig(): UmamiConfig | null {
    const scriptUrl = import.meta.env.VITE_UMAMI_SCRIPT_URL?.trim()
    const websiteId = import.meta.env.VITE_UMAMI_WEBSITE_ID?.trim()

    if (!scriptUrl || !websiteId) {
        return null
    }

    const domains = import.meta.env.VITE_UMAMI_DOMAINS?.trim()

    return domains ? { scriptUrl, websiteId, domains } : { scriptUrl, websiteId }
}

export function isUmamiEnabled(): boolean {
    return getUmamiConfig() !== null
}

export function loadUmamiScript(config: UmamiConfig): Promise<void> {
    if (typeof window === 'undefined') {
        return Promise.resolve()
    }

    if (window.umami) {
        return Promise.resolve()
    }

    if (scriptLoadPromise) {
        return scriptLoadPromise
    }

    scriptLoadPromise = new Promise((resolve, reject) => {
        const existing = document.querySelector<HTMLScriptElement>(
            `script[data-website-id="${config.websiteId}"]`
        )

        if (existing) {
            if (existing.dataset.loaded === 'true') {
                resolve()
                return
            }

            existing.addEventListener('load', () => resolve(), { once: true })
            existing.addEventListener('error', () => reject(new Error('Umami script failed to load')), {
                once: true,
            })
            return
        }

        const script = document.createElement('script')
        script.defer = true
        script.src = config.scriptUrl
        script.dataset.websiteId = config.websiteId
        // SPA pageviews handled by VisitorAnalytics (skips authenticated routes)
        script.dataset.autoTrack = 'false'

        if (config.domains) {
            script.dataset.domains = config.domains
        }

        script.addEventListener(
            'load',
            () => {
                script.dataset.loaded = 'true'
                resolve()
            },
            { once: true }
        )
        script.addEventListener(
            'error',
            () => reject(new Error('Umami script failed to load')),
            { once: true }
        )

        document.head.appendChild(script)
    })

    return scriptLoadPromise
}

export function trackUmamiPageview(url: string): void {
    if (!window.umami) {
        return
    }

    window.umami.track((props) => ({
        ...props,
        url,
    }))
}

export function trackUmamiEvent(
    eventName: string,
    eventData?: Record<string, string | number | boolean | null | undefined>
): void {
    if (!window.umami) {
        return
    }

    const payload = eventData
        ? Object.fromEntries(
              Object.entries(eventData).filter(([, value]) => value !== undefined && value !== null)
          )
        : undefined

    window.umami.track(eventName, payload)
}