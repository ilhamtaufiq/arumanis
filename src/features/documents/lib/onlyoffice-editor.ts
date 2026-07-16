export type OnlyOfficeViewerSearch = {
    title?: string
    mode?: 'view' | 'edit'
}

export function buildOnlyOfficeViewerUrl(
    mediaId: number,
    options?: { title?: string; mode?: 'view' | 'edit' },
): string {
    const params = new URLSearchParams()
    if (options?.title) {
        params.set('title', options.title)
    }
    if (options?.mode) {
        params.set('mode', options.mode)
    }
    const query = params.toString()
    return `/documents/onlyoffice/${mediaId}${query ? `?${query}` : ''}`
}

/** @deprecated prefer options object overload */
export function openOnlyOfficeViewer(mediaId: number, title?: string): void {
    window.open(buildOnlyOfficeViewerUrl(mediaId, { title }), '_blank', 'noopener,noreferrer')
}

export function openOnlyOfficeViewerWithMode(
    mediaId: number,
    options?: { title?: string; mode?: 'view' | 'edit' },
): void {
    window.open(buildOnlyOfficeViewerUrl(mediaId, options), '_blank', 'noopener,noreferrer')
}

export function normalizeDocumentServerUrl(url: string): string {
    const trimmed = url.trim()
    if (!trimmed) return trimmed
    return trimmed.endsWith('/') ? trimmed : `${trimmed}/`
}

/**
 * Route ONLYOFFICE through the app origin to avoid third-party service worker
 * failures when the editor is embedded in an iframe from arumanis.*.
 */
export function resolveDocumentServerUrl(apiUrl: string): string {
    if (typeof window !== 'undefined') {
        return `${window.location.origin}/office/`
    }
    return normalizeDocumentServerUrl(apiUrl)
}

type DocEditorInstance = {
    destroyEditor?: () => void
    forceSave?: () => void
    createConnector?: () => {
        executeMethod?: (name: string, args?: unknown[], callback?: (result: unknown) => void) => void
        callCommand?: (command: () => void, callback?: () => void) => void
    }
    downloadAs?: (format?: string) => void
}

type DocEditorWindow = Window &
    typeof globalThis & {
        DocEditor?: {
            instances?: Record<string, DocEditorInstance>
        }
    }

export function getOnlyOfficeEditorInstance(editorId: string): DocEditorInstance | undefined {
    const docWindow = window as DocEditorWindow
    return docWindow.DocEditor?.instances?.[editorId]
}

export function destroyOnlyOfficeEditor(editorId: string): void {
    getOnlyOfficeEditorInstance(editorId)?.destroyEditor?.()
}

export function forceSaveOnlyOfficeEditor(editorId: string): boolean {
    const instance = getOnlyOfficeEditorInstance(editorId)
    if (!instance) return false

    if (typeof instance.forceSave === 'function') {
        instance.forceSave()
        return true
    }

    const connector = instance.createConnector?.()
    if (connector?.executeMethod) {
        connector.executeMethod('ForceSave', [])
        return true
    }

    return false
}

export function mapOnlyOfficeLoadError(code: number, description: string): string {
    switch (code) {
        case -2:
            return 'Tidak dapat terhubung ke ONLYOFFICE Document Server. Pastikan server office aktif dan dapat diakses.'
        case -3:
            return 'Komponen ONLYOFFICE gagal dimuat. Coba muat ulang halaman atau buka dokumen di tab baru.'
        default:
            return description || 'Gagal memuat editor ONLYOFFICE.'
    }
}

export function mapOnlyOfficeRuntimeError(event: { data?: string }): string {
    const code = event.data ?? ''

    if (code.includes('download') || code.includes('Download') || code.includes('-4')) {
        return 'Unduhan dokumen gagal. ONLYOFFICE tidak dapat mengambil berkas dari server API. Pastikan APP_URL backend dapat diakses dari container ONLYOFFICE.'
    }

    if (code.includes('convert') || code.includes('Convert')) {
        return 'Konversi dokumen gagal. Periksa format berkas dan ketersediaan ONLYOFFICE Document Server.'
    }

    return code
        ? `Editor ONLYOFFICE mengalami kesalahan: ${code}`
        : 'Editor ONLYOFFICE mengalami kesalahan tak dikenal.'
}

export function isMobileDocumentViewport(width?: number): boolean {
    if (typeof width === 'number') return width < 768
    if (typeof window === 'undefined') return false
    return window.matchMedia('(max-width: 767px)').matches
}
