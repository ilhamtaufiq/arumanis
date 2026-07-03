import type { KontrakAddendumAttachment } from '../types';

export const ADDENDUM_ATTACHMENT_TYPES = {
    surat_permohonan: 'Surat Permohonan',
    surat_undangan_pembahasan: 'Surat Undangan Pembahasan',
    risalah_rapat_pembahasan: 'Risalah Rapat Pembahasan',
    surat_perintah_pelaksanaan_kerja_sesuai_addendum: 'Surat Perintah Pelaksanaan Kerja Sesuai Addendum',
    cco: 'CCO',
    laporan_pekerjaan: 'Laporan Pekerjaan',
    berita_acara: 'Berita Acara',
    sk_peneliti_kontrak: 'SK Peneliti Kontrak',
} as const;

export type AddendumAttachmentType = keyof typeof ADDENDUM_ATTACHMENT_TYPES;

export function buildAttachmentChecklist(attachments?: KontrakAddendumAttachment[]) {
    return Object.entries(ADDENDUM_ATTACHMENT_TYPES).map(([type, label]) => {
        const file = attachments?.find((attachment) => attachment.document_type === type);
        return {
            type: type as AddendumAttachmentType,
            label,
            file,
            uploaded: Boolean(file),
        };
    });
}