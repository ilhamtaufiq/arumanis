import { getFileExtension, isImageFile } from '@/lib/file-preview';

const ONLYOFFICE_EXTENSIONS = new Set([
    'doc', 'docx', 'odt', 'rtf', 'txt',
    'xls', 'xlsx', 'ods', 'csv',
    'ppt', 'pptx', 'odp',
    'pdf',
]);

export function isOnlyOfficeSupported(source?: string): boolean {
    if (!source || isImageFile(source)) return false;
    return ONLYOFFICE_EXTENSIONS.has(getFileExtension(source));
}