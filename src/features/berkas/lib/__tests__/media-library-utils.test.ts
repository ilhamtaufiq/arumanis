import { describe, expect, it } from 'vitest';
import {
    berkasToMediaItem,
    buildPekerjaanFolders,
    buildPekerjaanFoldersFromList,
    isImageMediaItem,
    pekerjaanListSortParams,
    sortDriveItems,
} from '../media-library-utils';
import type { Berkas } from '@/features/berkas/types';
import type { Pekerjaan } from '@/features/pekerjaan/types';

describe('media-library-utils', () => {
    it('treats scanned berkas image as image media', () => {
        const item = berkasToMediaItem({
            id: 1,
            pekerjaan_id: 10,
            jenis_dokumen: 'scan-lapangan.jpg',
            berkas_url: 'https://example.com/files/scan-lapangan.jpg',
            created_at: '2026-01-01T00:00:00Z',
            updated_at: '2026-01-01T00:00:00Z',
        } satisfies Berkas);

        expect(item.type).toBe('image');
        expect(isImageMediaItem(item)).toBe(true);
    });

    it('groups media into pekerjaan folders', () => {
        const pekerjaanList = [
            { id: 10, nama_paket: 'Paket A' },
            { id: 20, nama_paket: 'Paket B' },
        ] as Pekerjaan[];

        const folders = buildPekerjaanFolders(pekerjaanList, [
            {
                id: 1,
                type: 'image',
                name: 'Foto 0%',
                url: 'https://example.com/a.jpg',
                pekerjaan_id: 10,
                pekerjaan_name: 'Paket A',
                created_at: '2026-02-01T00:00:00Z',
            },
            {
                id: 2,
                type: 'document',
                name: 'Kontrak',
                url: 'https://example.com/kontrak.pdf',
                pekerjaan_id: 10,
                pekerjaan_name: 'Paket A',
                created_at: '2026-01-01T00:00:00Z',
            },
        ]);

        expect(folders).toHaveLength(1);
        expect(folders[0]?.pekerjaan.id).toBe(10);
        expect(folders[0]?.totalItems).toBe(2);
        expect(folders[0]?.photoCount).toBe(1);
        expect(folders[0]?.docCount).toBe(1);
    });

    it('builds folders from pekerjaan list metadata', () => {
        const folders = buildPekerjaanFoldersFromList([
            {
                id: 10,
                nama_paket: 'Paket A',
                foto_count: 5,
                updated_at: '2026-02-01T00:00:00Z',
                created_at: '2026-01-01T00:00:00Z',
            },
            {
                id: 20,
                nama_paket: 'Paket B',
                foto_count: 0,
                updated_at: '2026-01-15T00:00:00Z',
                created_at: '2026-01-01T00:00:00Z',
            },
        ] as Pekerjaan[]);

        expect(folders).toHaveLength(2);
        expect(folders[0]?.photoCount).toBe(5);
        expect(folders[0]?.latestAt).toBe('2026-02-01T00:00:00Z');
        expect(folders[1]?.photoCount).toBe(0);
    });

    it('sorts drive items ascending by name', () => {
        const sorted = sortDriveItems([
            { name: 'Zeta', created_at: '2026-01-01T00:00:00Z' },
            { name: 'Alpha', created_at: '2026-02-01T00:00:00Z' },
        ], 'name', 'asc');

        expect(sorted.map((item) => item.name)).toEqual(['Alpha', 'Zeta']);
    });

    it('maps pekerjaan sort params for ascending date', () => {
        expect(pekerjaanListSortParams('date', 'asc')).toEqual({
            sort_by: 'updated_at',
            sort_direction: 'asc',
        });
    });
});