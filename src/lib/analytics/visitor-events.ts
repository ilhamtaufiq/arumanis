import { isUmamiEnabled, loadUmamiScript, getUmamiConfig, trackUmamiEvent } from './umami'

export type VisitorEventName =
    | 'publication_view'
    | 'publication_download'
    | 'spm_detail_view'
    | 'innovation_page_view'

export type VisitorEventPayload = Record<string, string | number | boolean>

/**
 * Hybrid analytics: Umami custom events now; native Arumanis API can be added later.
 */
export async function trackVisitorEvent(
    name: VisitorEventName,
    payload: VisitorEventPayload = {}
): Promise<void> {
    if (!isUmamiEnabled()) {
        return
    }

    const config = getUmamiConfig()
    if (!config) {
        return
    }

    try {
        await loadUmamiScript(config)
        trackUmamiEvent(name, {
            ...payload,
            path: window.location.pathname,
        })
    } catch {
        // Analytics must not break the app
    }
}