import { getFileExtension } from '@/lib/file-preview';
import { isOnlyOfficeSupported } from '@/features/documents/lib/onlyoffice-support';

type BerkasLike = {
    berkas_url: string;
    jenis_dokumen: string;
};

function hasRecognizedExtension(source: string): boolean {
    return isOnlyOfficeSupported(source) || getFileExtension(source) === 'pdf';
}

export function resolveBerkasFileName(berkas: BerkasLike): string {
    const urlFileName = berkas.berkas_url.split('?')[0]?.split('/').pop() ?? '';

    if (hasRecognizedExtension(urlFileName)) {
        return urlFileName;
    }

    if (hasRecognizedExtension(berkas.jenis_dokumen)) {
        return berkas.jenis_dokumen;
    }

    return berkas.jenis_dokumen || urlFileName;
}

type BerkasUnduhan = BerkasLike & {
    original_name?: string | null;
    file_name?: string | null;
};

/**
 * Nama berkas untuk unduhan. `original_name` dari API berisi nama tanpa ekstensi (stem), jadi ekstensi
 * diambil dari `file_name` (`{uuid}.{ext}`) atau dari URL, lalu ditambahkan bila belum ada.
 */
export function namaUnduhBerkas(berkas: BerkasUnduhan): string {
    const base = berkas.original_name?.trim() || resolveBerkasFileName(berkas);
    const ext = getFileExtension(berkas.file_name ?? '') || getFileExtension(berkas.berkas_url);
    if (!ext || base.toLowerCase().endsWith(`.${ext}`)) return base;
    return `${base}.${ext}`;
}
