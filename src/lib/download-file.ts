/**
 * Large-file download helpers.
 *
 * Never use fetch() + response.blob() for multi-hundred-MB / multi-GB archives:
 * the whole body is buffered in the JS heap and will OOM or surface as
 * `TypeError: Failed to fetch` / `net::ERR_FAILED 200`.
 *
 * Same-origin `/bff/api/...` URLs send the session cookie automatically, so the
 * browser can stream the response straight to disk.
 */

const API_PREFIX = '/bff/api'

/** Build a same-origin BFF API URL (with optional query params). */
export function buildBffApiUrl(
    endpoint: string,
    params?: Record<string, string | number | undefined | null>,
): string {
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
    let url = `${API_PREFIX}${path}`

    if (params) {
        const search = new URLSearchParams()
        for (const [key, value] of Object.entries(params)) {
            if (value !== undefined && value !== null && value !== '') {
                search.append(key, String(value))
            }
        }
        const qs = search.toString()
        if (qs) url += `?${qs}`
    }

    return url
}

/** Sanitize a filename for the download attribute / Content-Disposition fallback. */
export function safeDownloadFilename(name: string, fallback = 'download'): string {
    const cleaned = name.replace(/[\\/:*?"<>|\u0000-\u001f]/g, '_').trim()
    return cleaned || fallback
}

/**
 * Trigger a browser-managed download (streams to disk; safe for large files).
 * Relies on server `Content-Disposition: attachment`.
 */
export function triggerBrowserDownload(url: string, filename?: string): void {
    const link = document.createElement('a')
    link.href = url
    if (filename) {
        link.download = filename
    }
    link.rel = 'noopener'
    // Avoid stealing focus / navigating the SPA if Content-Disposition is missing.
    link.target = '_self'
    document.body.appendChild(link)
    link.click()
    link.remove()
}

/**
 * Convenience: download a BFF API binary endpoint without buffering in JS.
 */
export function downloadBffApiFile(
    endpoint: string,
    options?: {
        params?: Record<string, string | number | undefined | null>
        filename?: string
    },
): void {
    const url = buildBffApiUrl(endpoint, options?.params)
    triggerBrowserDownload(url, options?.filename)
}

/**
 * Small binary downloads only (templates, tiny exports). Loads the full body
 * into memory — do not use for zip archives of media.
 */
export function downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
}
