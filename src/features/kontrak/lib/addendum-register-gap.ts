import type { KontrakAddendumRegisterGap } from '../types';

export const ADDENDUM_REGISTER_GAP_HEADLINE =
    'Nomor register addendum sudah dibuat, tetapi detail pengajuan belum ada dan belum disetujui.';

export const ADDENDUM_REGISTER_GAP_DESCRIPTION =
    'Nomor addendum sudah tercatat di Register Dokumen (tipe ADD / Addendum). Lengkapi data addendum di modul ini agar dapat diajukan dan disetujui admin.';

export type RegisterGapStatusItem = {
    key: 'register' | 'detail' | 'approval';
    label: string;
    value: string;
    done: boolean;
};

export function getRegisterGapStatusItems(gap: KontrakAddendumRegisterGap): RegisterGapStatusItem[] {
    return [
        {
            key: 'register',
            label: 'Nomor register',
            value: gap.nomor_register,
            done: true,
        },
        {
            key: 'detail',
            label: 'Detail addendum',
            value: 'Belum ada — data pengajuan, lampiran, dan nilai belum diisi',
            done: false,
        },
        {
            key: 'approval',
            label: 'Persetujuan',
            value: 'Belum disetujui — pengajuan addendum belum tercatat/disetujui',
            done: false,
        },
    ];
}