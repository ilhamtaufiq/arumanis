import type { Kecamatan } from '@/features/kecamatan/types';
import type { Desa } from '@/features/desa/types';
import type { Kegiatan } from '@/features/kegiatan/types';
import type { Pengawas } from '@/features/pengawas/types';

export interface BeritaAcaraEntry {
    nomor: string;
    tanggal: string;
}

export interface BeritaAcaraData {
    ba_lpp: BeritaAcaraEntry[];
    serah_terima_pertama: BeritaAcaraEntry[];
    ba_php: BeritaAcaraEntry[];
    ba_stp: BeritaAcaraEntry[];
}

export interface BeritaAcara {
    id: number;
    pekerjaan_id: number;
    data: BeritaAcaraData;
    created_at: string;
    updated_at: string;
}

export interface Tag {
    id: number;
    name: string;
    slug: string;
    color: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface Penyedia {
    id: number;
    nama: string;
    direktur?: string;
    alamat?: string;
    bank?: string;
    norek?: string;
    created_at?: string;
    updated_at?: string;
}

export interface Pekerjaan {
    id: number;
    kode_rekening: string | null;
    nama_paket: string;
    pagu: number;
    kecamatan_id: number;
    desa_id: number;
    kegiatan_id: number | null;
    pengawas_id?: number | null;
    pendamping_id?: number | null;
    kecamatan?: Kecamatan;
    desa?: Desa;
    kegiatan?: Kegiatan;
    pengawas?: Pengawas;
    pendamping?: Pengawas;
    berita_acara?: BeritaAcara;
    tags?: Tag[];
    draft?: DraftPekerjaan;
    created_at: string;
    updated_at: string;
}

export interface PekerjaanResponse {
    data: Pekerjaan[];
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

export interface DraftPekerjaan {
    id: number;
    pekerjaan_id: number;
    penyedia_id?: number | null;
    nama_pelaksana: string | null;
    kode_rup: string | null;
    kode_paket: string | null;
    pekerjaan?: Pekerjaan;
    penyedia?: Penyedia;
    created_at: string;
    updated_at: string;
}

export interface DraftPekerjaanResponse {
    data: Pekerjaan[]; // Updated: returns Pekerjaan[] now
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
        path: string;
        per_page: number;
        to: number;
        total: number;
    };
}
