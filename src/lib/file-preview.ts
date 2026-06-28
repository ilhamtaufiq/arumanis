export type PreviewKind = 'image' | 'pdf' | 'office' | 'unknown';

export const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'avif', 'heic', 'heif']);
const OFFICE_EXTENSIONS = new Set(['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'odt', 'ods', 'odp', 'rtf', 'txt', 'csv']);

export function getFileExtension(source?: string): string {
    if (!source) return '';
    const path = source.split('?')[0]?.split('#')[0] ?? '';
    const lastSegment = path.split('/').pop() ?? '';
    if (!lastSegment.includes('.')) return '';
    return lastSegment.split('.').pop()?.toLowerCase() ?? '';
}

export function isImageFile(source?: string): boolean {
    return IMAGE_EXTENSIONS.has(getFileExtension(source));
}

export function getPreviewKind(uri?: string, fileName?: string): PreviewKind {
    const ext = getFileExtension(fileName || uri);
    if (IMAGE_EXTENSIONS.has(ext)) return 'image';
    if (ext === 'pdf') return 'pdf';
    if (OFFICE_EXTENSIONS.has(ext)) return 'office';
    return 'unknown';
}