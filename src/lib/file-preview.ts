export type PreviewKind = 'image' | 'pdf' | 'office' | 'unknown';

const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg']);
const OFFICE_EXTENSIONS = new Set(['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx']);

export function getFileExtension(source?: string): string {
    if (!source) return '';
    const path = source.split('?')[0]?.split('#')[0] ?? '';
    return path.split('.').pop()?.toLowerCase() ?? '';
}

export function getPreviewKind(uri?: string, fileName?: string): PreviewKind {
    const ext = getFileExtension(fileName || uri);
    if (IMAGE_EXTENSIONS.has(ext)) return 'image';
    if (ext === 'pdf') return 'pdf';
    if (OFFICE_EXTENSIONS.has(ext)) return 'office';
    return 'unknown';
}

export function isLocalPreviewUrl(url: string): boolean {
    try {
        const hostname = new URL(url).hostname;
        return hostname.endsWith('.test')
            || hostname === 'localhost'
            || hostname === '127.0.0.1';
    } catch {
        return false;
    }
}