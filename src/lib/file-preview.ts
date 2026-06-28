export type PreviewKind = 'image' | 'pdf' | 'office' | 'unknown';

const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg']);
const OFFICE_EXTENSIONS = new Set(['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'odt', 'ods', 'odp', 'rtf', 'txt', 'csv']);

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