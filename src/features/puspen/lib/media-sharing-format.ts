export function formatFileSize(size: number) {
    if (size < 1024) return `${size} B`
    if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`
    return `${(size / 1024 / 1024).toFixed(1)} MB`
}

export function getFileTypeLabel(mimeType?: string) {
    if (!mimeType) return 'FILE'
    if (mimeType.startsWith('image/')) return 'GAMBAR'
    if (mimeType.startsWith('video/')) return 'VIDEO'
    if (mimeType.includes('pdf')) return 'PDF'
    return 'DOKUMEN'
}

export function isPreviewableMime(mimeType?: string) {
    return Boolean(
        mimeType?.startsWith('image/') ||
            mimeType?.startsWith('video/') ||
            mimeType?.includes('pdf'),
    )
}