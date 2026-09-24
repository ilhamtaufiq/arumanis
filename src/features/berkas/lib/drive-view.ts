import type { UserDriveItem } from '../api/user-drive'

export type DriveFileKind = 'document' | 'spreadsheet' | 'presentation' | 'pdf' | 'image' | 'archive' | 'other'

export type DriveSort = 'name' | 'updated' | 'size'

const EXT_KIND: Record<string, DriveFileKind> = {
    pdf: 'pdf',
    doc: 'document',
    docx: 'document',
    txt: 'document',
    md: 'document',
    rtf: 'document',
    odt: 'document',
    xls: 'spreadsheet',
    xlsx: 'spreadsheet',
    csv: 'spreadsheet',
    ods: 'spreadsheet',
    ppt: 'presentation',
    pptx: 'presentation',
    odp: 'presentation',
    png: 'image',
    jpg: 'image',
    jpeg: 'image',
    gif: 'image',
    webp: 'image',
    svg: 'image',
    bmp: 'image',
    zip: 'archive',
    rar: 'archive',
    '7z': 'archive',
    tar: 'archive',
    gz: 'archive',
}

/** Tentukan jenis file dari MIME dulu, fallback ke ekstensi nama. */
export function fileKindFromMime(mime?: string | null, filename?: string | null): DriveFileKind {
    const m = (mime ?? '').toLowerCase()
    if (m.includes('pdf')) return 'pdf'
    if (m.includes('spreadsheet') || m.includes('excel') || m.includes('csv')) return 'spreadsheet'
    if (m.includes('presentation') || m.includes('powerpoint')) return 'presentation'
    if (m.startsWith('image/')) return 'image'
    if (m.includes('zip') || m.includes('archive') || m.includes('compressed')) return 'archive'
    if (m.includes('word') || m.includes('document') || m.startsWith('text/')) return 'document'

    const ext = (filename ?? '').split('.').pop()?.toLowerCase() ?? ''
    return EXT_KIND[ext] ?? 'other'
}

export function formatBytes(bytes?: number | null): string {
    if (bytes == null || !Number.isFinite(bytes)) return '—'
    if (bytes <= 0) return '0 B'
    const units = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)))
    const value = bytes / 1024 ** i
    return `${value >= 100 ? Math.round(value) : value.toFixed(1)} ${units[i]}`
}

export function formatDriveDate(iso?: string | null): string {
    if (!iso) return '—'
    const time = Date.parse(iso)
    if (Number.isNaN(time)) return '—'
    return new Date(time).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function splitDriveItems(items: UserDriveItem[]): { folders: UserDriveItem[]; files: UserDriveItem[] } {
    const folders: UserDriveItem[] = []
    const files: UserDriveItem[] = []
    for (const item of items) {
        if (item.kind === 'folder') folders.push(item)
        else files.push(item)
    }
    return { folders, files }
}

export function sortDriveItems(items: UserDriveItem[], sort: DriveSort): UserDriveItem[] {
    return [...items].sort((a, b) => {
        if (sort === 'name') return a.name.localeCompare(b.name, 'id')
        if (sort === 'size') return (b.file_size ?? -1) - (a.file_size ?? -1)
        return Date.parse(b.updated_at || '') - Date.parse(a.updated_at || '')
    })
}
