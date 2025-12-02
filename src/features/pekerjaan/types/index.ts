import type { Kecamatan } from '@/features/kecamatan/types';
import type { Desa } from '@/features/desa/types';
import type { Kegiatan } from '@/features/kegiatan/types';

export interface Pekerjaan {
    id: number;
    kode_rekening: string | null;
    nama_paket: string;
    pagu: number;
    kecamatan_id: number;
    desa_id: number;
    kegiatan_id: number | null;
    kecamatan?: Kecamatan;
    desa?: Desa;
    kegiatan?: Kegiatan;
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
