export function buildOnlyOfficeViewerUrl(mediaId: number, title?: string): string {
    const params = new URLSearchParams();
    if (title) {
        params.set('title', title);
    }
    const query = params.toString();
    return `/documents/onlyoffice/${mediaId}${query ? `?${query}` : ''}`;
}

export function openOnlyOfficeViewer(mediaId: number, title?: string): void {
    window.open(buildOnlyOfficeViewerUrl(mediaId, title), '_blank', 'noopener,noreferrer');
}

export function normalizeDocumentServerUrl(url: string): string {
    const trimmed = url.trim();
    if (!trimmed) return trimmed;
    return trimmed.endsWith('/') ? trimmed : `${trimmed}/`;
}

type DocEditorWindow = Window &
    typeof globalThis & {
        DocEditor?: {
            instances?: Record<string, { destroyEditor?: () => void }>;
        };
    };

export function destroyOnlyOfficeEditor(editorId: string): void {
    const docWindow = window as DocEditorWindow;
    const instance = docWindow.DocEditor?.instances?.[editorId];
    instance?.destroyEditor?.();
}

export function mapOnlyOfficeLoadError(code: number, description: string): string {
    switch (code) {
        case -2:
            return 'Tidak dapat terhubung ke ONLYOFFICE Document Server. Pastikan server office aktif dan dapat diakses.';
        case -3:
            return 'Komponen ONLYOFFICE gagal dimuat. Coba muat ulang halaman atau buka dokumen di tab baru.';
        default:
            return description || 'Gagal memuat editor ONLYOFFICE.';
    }
}

export function mapOnlyOfficeRuntimeError(event: { data?: string }): string {
    const code = event.data ?? '';

    if (code.includes('download') || code.includes('Download') || code.includes('-4')) {
        return 'Unduhan dokumen gagal. ONLYOFFICE tidak dapat mengambil berkas dari server API. Pastikan APP_URL backend dapat diakses dari container ONLYOFFICE.';
    }

    if (code.includes('convert') || code.includes('Convert')) {
        return 'Konversi dokumen gagal. Periksa format berkas dan ketersediaan ONLYOFFICE Document Server.';
    }

    return code
        ? `Editor ONLYOFFICE mengalami kesalahan: ${code}`
        : 'Editor ONLYOFFICE mengalami kesalahan tak dikenal.';
}