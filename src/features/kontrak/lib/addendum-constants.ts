import type { KontrakAddendumAttachment } from '../types';

export const ADDENDUM_ATTACHMENT_TYPES = {
    cco: 'CCO',
    dokumen_nego_addendum: 'Dokumen Nego Addendum',
    surat_permohonan_pembahasan: 'Surat Permohonan Pembahasan Adendum (Penyedia)',
    surat_undangan_pembahasan: 'Surat Undangan Pembahasan (PPK)',
    berita_acara_negosiasi_harga: 'Berita Acara Negosiasi Harga Item Pekerjaan Baru',
    risalah_rapat_pembahasan: 'Risalah Rapat Pembahasan Adendum',
    berita_acara_penelitian: 'Berita Acara Penelitian',
    ba_cco_addendum: 'BA CCO & Adendum Kontrak',
    surat_perintah_pelaksanaan: 'Surat Perintah Pelaksanaan (PPK)',
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