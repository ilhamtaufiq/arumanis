import type { Berkas } from '@/features/berkas/types';
import type { UserDriveItem } from '@/features/berkas/api/user-drive';
import type { MediaItem } from '@/features/berkas/components/MediaCard';
import type { Foto } from '@/features/foto/types';
import type { Pekerjaan } from '@/features/pekerjaan/types';
import type { PuspenMediaLibraryItem } from '@/features/puspen/api/media-sharing';
import { isImageFile } from '@/lib/file-preview';
import { formatPekerjaanLokasi } from '@/lib/wilayah-fields';

/** Root drive pagination (pekerjaan folders) */
export const MEDIA_LIBRARY_ROOT_PER_PAGE = 24
export const MEDIA_LIBRARY_FOLDER_FOTO_PER_PAGE = 48
export const MEDIA_LIBRARY_USER_DRIVE_PER_PAGE = 48

export type MediaLibraryFilterType = 'all' | 'images' | 'docs'
export type MediaLibraryViewType = 'grid' | 'list'

export type DriveZone = 'puspen' | 'pekerjaan' | 'users';
export type DriveSortField = 'date' | 'name';
export type DriveSortDirection = 'asc' | 'desc';

export function sortDriveItems<T extends { created_at: string; name: string }>(
    items: T[],
    field: DriveSortField,
    direction: DriveSortDirection,
): T[] {
    const sorted = [...items];

    sorted.sort((a, b) => {
        const comparison = field === 'date'
            ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            : a.name.localeCompare(b.name, 'id');

        return direction === 'asc' ? comparison : -comparison;
    });

    return sorted;
}

export function pekerjaanListSortParams(
    field: DriveSortField,
    direction: DriveSortDirection,
): { sort_by: string; sort_direction: DriveSortDirection } {
    return {
        sort_by: field === 'name' ? 'nama_paket' : 'updated_at',
        sort_direction: direction,
    };
}

export function filterToMimeGroup(filter: 'all' | 'images' | 'docs'): 'all' | 'image' | 'document' {
    if (filter === 'images') return 'image';
    if (filter === 'docs') return 'document';
    return 'all';
}

export function fotoToMediaItem(foto: Foto): MediaItem {
    return {
        id: foto.id,
        source: 'pekerjaan',
        type: 'image',
        name: foto.komponen?.komponen || `Foto ${foto.keterangan}`,
        url: foto.foto_url,
        pekerjaan_id: foto.pekerjaan_id,
        pekerjaan_name: foto.pekerjaan?.nama_paket || '-',
        created_at: foto.created_at,
        progress: foto.keterangan,
        koordinat: foto.koordinat,
        komponen: foto.komponen?.komponen,
    };
}

export function berkasToMediaItem(berkas: Berkas): MediaItem {
    const isImage = isImageFile(berkas.berkas_url) || isImageFile(berkas.jenis_dokumen);

    return {
        id: berkas.id,
        source: 'pekerjaan',
        type: isImage ? 'image' : 'document',
        name: berkas.jenis_dokumen,
        url: berkas.berkas_url,
        media_id: berkas.media_id,
        pekerjaan_id: berkas.pekerjaan_id,
        pekerjaan_name: berkas.pekerjaan?.nama_paket || '-',
        created_at: berkas.created_at,
        jenis_dokumen: berkas.jenis_dokumen,
    };
}

export function puspenToMediaItem(item: PuspenMediaLibraryItem): MediaItem {
    const isImage = item.mimeType.startsWith('image/');

    return {
        id: item.id,
        source: 'puspen',
        type: isImage ? 'image' : 'document',
        name: item.name || item.fileName,
        url: item.url ?? '',
        pekerjaan_name: item.modelType,
        created_at: item.createdAt ?? new Date().toISOString(),
    };
}

export function userDriveFileToMediaItem(item: UserDriveItem): MediaItem {
    const isImage = (item.mime_type?.startsWith('image/') ?? false)
        || isImageFile(item.file_url ?? item.name);

    return {
        id: item.id,
        source: 'user',
        type: isImage ? 'image' : 'document',
        name: item.name,
        url: item.file_url ?? '',
        media_id: item.media_id,
        created_at: item.created_at,
    };
}

export function buildMediaItems(
    fotos: Foto[] | undefined,
    berkasList: Berkas[] | undefined,
    filter: 'all' | 'images' | 'docs',
): MediaItem[] {
    const items: MediaItem[] = [];

    if (filter !== 'docs' && fotos) {
        items.push(...fotos.map(fotoToMediaItem));
    }
    if (filter !== 'images' && berkasList) {
        items.push(...berkasList.map(berkasToMediaItem));
    }

    return items;
}

export type PekerjaanFolder = {
    pekerjaan: Pekerjaan;
    totalItems: number;
    photoCount: number;
    docCount: number;
    latestAt: string | null;
};

export function pekerjaanToFolder(pekerjaan: Pekerjaan): PekerjaanFolder {
    const photoCount = pekerjaan.foto_count ?? 0;

    return {
        pekerjaan,
        totalItems: photoCount,
        photoCount,
        docCount: 0,
        latestAt: pekerjaan.updated_at ?? null,
    };
}

export function buildPekerjaanFoldersFromList(pekerjaanList: Pekerjaan[]): PekerjaanFolder[] {
    return pekerjaanList.map(pekerjaanToFolder);
}

export function buildPekerjaanFolders(
    pekerjaanList: Pekerjaan[],
    mediaItems: MediaItem[],
): PekerjaanFolder[] {
    const byPekerjaan = new Map<number, MediaItem[]>();

    for (const item of mediaItems) {
        const bucket = byPekerjaan.get(item.pekerjaan_id) ?? [];
        bucket.push(item);
        byPekerjaan.set(item.pekerjaan_id, bucket);
    }

    return pekerjaanList
        .map((pekerjaan) => {
            const items = byPekerjaan.get(pekerjaan.id) ?? [];
            const photoCount = items.filter((item) => item.type === 'image').length;
            const docCount = items.filter((item) => item.type === 'document').length;
            const latestAt = items.reduce<string | null>((latest, item) => {
                if (!latest) return item.created_at;
                return new Date(item.created_at) > new Date(latest) ? item.created_at : latest;
            }, null);

            return {
                pekerjaan,
                totalItems: items.length,
                photoCount,
                docCount,
                latestAt,
            };
        })
        .filter((folder) => folder.totalItems > 0)
        .sort((a, b) => {
            const aTime = a.latestAt ? new Date(a.latestAt).getTime() : 0;
            const bTime = b.latestAt ? new Date(b.latestAt).getTime() : 0;
            return bTime - aTime;
        });
}

export function isImageMediaItem(item: MediaItem): boolean {
    return item.type === 'image' || isImageFile(item.url) || isImageFile(item.name);
}

export function formatFolderLocation(pekerjaan: Pekerjaan): string {
    return formatPekerjaanLokasi(pekerjaan, {
        separator: ' · ',
        empty: 'Lokasi tidak tersedia',
    });
}