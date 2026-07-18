/**
 * SPSE session helpers — cookie header build, bookmarklet, URL import.
 *
 * @see docs/runbooks/spse.md
 */

/**
 * Build cookie_header for the SPSE session API.
 *
 * Accepts:
 * - bare SPSE_SESSION value (preferred UX)
 * - "SPSE_SESSION=..."
 * - full document.cookie / multi-cookie header that already includes SPSE_SESSION
 */
export function buildSpseCookieHeader(input: string): string {
    const raw = input.trim()
    if (!raw) return ''

    // Full header or already named cookie — keep as-is
    if (/SPSE_SESSION\s*=/i.test(raw)) {
        return raw
    }

    // User only pasted the cookie value
    return `SPSE_SESSION=${raw}`
}

/** Strip accidental "SPSE_SESSION=" prefix when showing value-only field. */
export function normalizeSpseSessionValueInput(input: string): string {
    const raw = input.trim()
    if (!raw) return ''

    // Single cookie line only — strip name so the field stays value-only
    if (/^SPSE_SESSION\s*=/i.test(raw) && !raw.includes(';')) {
        return raw.replace(/^SPSE_SESSION\s*=/i, '').trim()
    }

    return raw
}

/** Extract SPSE_SESSION value from a cookie header string. */
export function extractSpseSessionValue(cookieHeader: string): string | null {
    const raw = cookieHeader.trim()
    if (!raw) return null

    const match = raw.match(/(?:^|;\s*)SPSE_SESSION=([^;]*)/i)
    if (!match) return null

    let value = match[1]?.trim() ?? ''
    if (!value) return null

    try {
        value = decodeURIComponent(value)
    } catch {
        // keep raw if not URI-encoded
    }

    return value
}

export type SpseSessionUrlPayload = {
    /** Bare session value or full cookie header */
    input: string
    /** Which query key was used */
    source: 'spse_session' | 'spse_cookie'
}

/**
 * Read session payload from URL search params (bookmarklet redirect).
 * Prefers bare `spse_session`, falls back to full `spse_cookie`.
 */
export function readSpseSessionFromSearchParams(
    search: URLSearchParams | Record<string, string | undefined>,
): SpseSessionUrlPayload | null {
    const get = (key: string): string | undefined => {
        if (search instanceof URLSearchParams) {
            return search.get(key) ?? undefined
        }
        const value = search[key]
        return typeof value === 'string' && value.length > 0 ? value : undefined
    }

    const session = get('spse_session')
    if (session) {
        return { input: session, source: 'spse_session' }
    }

    const cookie = get('spse_cookie')
    if (cookie) {
        return { input: cookie, source: 'spse_cookie' }
    }

    return null
}

/** Absolute return URL for bookmarklet (no trailing slash, no query). */
export function resolveSpseReturnUrl(origin: string, path = '/procurement-sync'): string {
    const base = origin.replace(/\/$/, '')
    const normalizedPath = path.startsWith('/') ? path : `/${path}`
    return `${base}${normalizedPath.replace(/\/$/, '')}`
}

/**
 * Build a drag-to-bookmarks `javascript:` URL.
 *
 * When clicked on a SPSE tab (after login), reads `SPSE_SESSION` from
 * `document.cookie` and redirects to Arumanis with `?spse_session=...`.
 */
export function buildSpseBookmarkletHref(returnUrl: string): string {
    const target = returnUrl.replace(/\/$/, '')

    // Keep the body compact — bookmarklet length limits exist in some browsers.
    const code = `(function(){try{var h=location.hostname||'';if(!/inaproc\\.id$/i.test(h)&&h!=='localhost'){alert('Buka tab SPSE (spse.inaproc.id), login dulu, lalu klik bookmark ini.');return;}var m=document.cookie.match(/(?:^|;\\s*)SPSE_SESSION=([^;]+)/i);if(!m||!m[1]){alert('Cookie SPSE_SESSION tidak ditemukan. Pastikan sudah login SPSE + CAPTCHA.');return;}var v=m[1];try{v=decodeURIComponent(v);}catch(e){}location.href=${JSON.stringify(target)}+'?spse_session='+encodeURIComponent(v);}catch(err){alert('Gagal ambil session SPSE: '+(err&&err.message?err.message:err));}})();`

    return `javascript:${code}`
}

export const SPSE_BOOKMARKLET_TITLE = 'Kirim Session → Arumanis'
