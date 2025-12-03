import type { Kegiatan } from '@/features/kegiatan/types';
import type { Pekerjaan } from '@/features/pekerjaan/types';

export interface Penyedia {
    id: number;
    nama: string;
    direktur: string | null;
    no_akta: string | null;
    notaris: string | null;
    tanggal_akta: string | null;
    alamat: string | null;
    bank: string | null;
    norek: string | null;
    created_at: string;
    updated_at: string;
}

export interface Kontrak {
    id: number;
    kode_rup: string | null;
    kode_paket: string | null;
    nomor_penawaran: string | null;
    tanggal_penawaran: string | null;
    nilai_kontrak: number | null;
    tgl_sppbj: string | null;
    tgl_spk: string | null;
    tgl_spmk: string | null;
    tgl_selesai: string | null;
    sppbj: string | null;
    spk: string | null;
    spmk: string | null;
    id_kegiatan: number | null;
    id_pekerjaan: number;
    id_penyedia: number;
    kegiatan?: Kegiatan;
    pekerjaan?: Pekerjaan;
    penyedia?: Penyedia;
    created_at: string;
    updated_at: string;
}

export interface KontrakResponse {
    data: Kontrak[];
    links: {
        first: string;
        last: string;
        prev: string | null;
        next: string | null;
    };
    meta: {
        current_page: number;
        from: number;
        last_page: number;
        links: {
            url: string | null;
            label: string;
            active: boolean;
        }[];
        path: string;
        per_page: number;
        to: number;
        total: number;
    };
}

export interface PenyediaResponse {
    data: Penyedia[];
    links: {
        first: string;
        last: string;
        prev: string | null;
        next: string | null;
    };
    meta: {
        current_page: number;
        from: number;
        last_page: number;
        links: {
            url: string | null;
            label: string;
            active: boolean;
        }[];
        path: string;
        per_page: number;
        to: number;
        total: number;
    };
}
