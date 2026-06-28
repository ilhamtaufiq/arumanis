const ONLYOFFICE_EXTENSIONS = new Set([
    'doc', 'docx', 'odt', 'rtf', 'txt',
    'xls', 'xlsx', 'ods', 'csv',
    'ppt', 'pptx', 'odp',
    'pdf',
]);

export function isOnlyOfficeSupported(source?: string): boolean {
    if (!source) return false;
    const path = source.split('?')[0]?.split('#')[0] ?? '';
    const ext = path.split('.').pop()?.toLowerCase() ?? '';
    return ONLYOFFICE_EXTENSIONS.has(ext);
}