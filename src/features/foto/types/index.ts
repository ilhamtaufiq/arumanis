import type { Pekerjaan } from '@/features/pekerjaan/types';
import type { Penerima } from '@/features/penerima/types';

export interface Foto {
    id: number;
    pekerjaan_id: number;
    komponen_id: number;
    penerima_id?: number;
    keterangan: '0%' | '25%' | '50%' | '75%' | '100%';
    koordinat: string;
    validasi_koordinat: boolean;
    validasi_koordinat_message?: string;
    foto_url: string;
    pekerjaan?: Pekerjaan;
    penerima?: Penerima;
    komponen?: {
        id: number;
        komponen: string;
    };
    created_at: string;
    updated_at: string;
}

export interface FotoFormData {
    pekerjaan_id: number;
    komponen_id: number;
    penerima_id?: number;
    keterangan: string;
    koordinat: string;
    validasi_koordinat: boolean;
    validasi_koordinat_message?: string;
    file: File | null;
}

export interface FotoParams {
    page?: number;
    search?: string;
    pekerjaan_id?: number;
    tahun?: string;
}

export interface FotoResponse {
    data: Foto[];
    links?: {
        first: string;
        last: string;
        prev: string | null;
        next: string | null;
    };
    meta?: {
        current_page: number;
        from: number;
        last_page: number;
        path: string;
        per_page: number;
        to: number;
        total: number;
    };
}
