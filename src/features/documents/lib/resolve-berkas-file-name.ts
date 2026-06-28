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