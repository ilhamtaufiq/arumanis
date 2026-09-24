import { describe, expect, it } from 'vitest'
import {
    fileKindFromMime,
    formatBytes,
    formatDriveDate,
    sortDriveItems,
    splitDriveItems,
    type DriveSort,
} from '../drive-view'
import type { UserDriveItem } from '../../api/user-drive'

const item = (overrides: Partial<UserDriveItem> & { id: number; name: string }): UserDriveItem => ({
    parent_id: null,
    kind: 'file',
    original_filename: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
})

describe('drive-view lib', () => {
    it('detects kind from mime first, extension fallback', () => {
        expect(fileKindFromMime('application/pdf', 'x.doc')).toBe('pdf')
        expect(fileKindFromMime(null, 'laporan.xlsx')).toBe('spreadsheet')
        expect(fileKindFromMime(null, 'slide.pptx')).toBe('presentation')
        expect(fileKindFromMime('image/png', null)).toBe('image')
        expect(fileKindFromMime(null, 'arsip.zip')).toBe('archive')
        expect(fileKindFromMime(null, 'aneh.xyz')).toBe('other')
        expect(fileKindFromMime(null, null)).toBe('other')
    })

    it('formats bytes in Indonesian units', () => {
        expect(formatBytes(null)).toBe('—')
        expect(formatBytes(0)).toBe('0 B')
        expect(formatBytes(512)).toBe('512 B')
        expect(formatBytes(2048)).toBe('2.0 KB')
        expect(formatBytes(5 * 1024 * 1024)).toBe('5.0 MB')
    })

    it('formats dates or dash', () => {
        expect(formatDriveDate(null)).toBe('—')
        expect(formatDriveDate('bukan-tanggal')).toBe('—')
        expect(formatDriveDate('2026-09-20T10:00:00Z')).toContain('2026')
    })

    it('splits folders and files', () => {
        const { folders, files } = splitDriveItems([
            item({ id: 1, name: 'A', kind: 'folder' }),
            item({ id: 2, name: 'b.pdf' }),
        ])
        expect(folders).toHaveLength(1)
        expect(files).toHaveLength(1)
    })

    it('sorts by name, updated, and size', () => {
        const list = [
            item({ id: 1, name: 'b', updated_at: '2026-01-01T00:00:00Z', file_size: 10 }),
            item({ id: 2, name: 'a', updated_at: '2026-02-01T00:00:00Z', file_size: 30 }),
            item({ id: 3, name: 'c', updated_at: '2026-01-15T00:00:00Z', file_size: 20 }),
        ]
        const by = (s: DriveSort) => sortDriveItems(list, s).map((i) => i.id)
        expect(by('name')).toEqual([2, 1, 3])
        expect(by('updated')).toEqual([2, 3, 1])
        expect(by('size')).toEqual([2, 3, 1])
    })
})
