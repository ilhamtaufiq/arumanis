import type { Pekerjaan } from '@/features/pekerjaan/types';

export interface Penerima {
    id: number;
    pekerjaan_id: number;
    nama: string;
    jumlah_jiwa: number;
    nik: string | null;
    alamat: string | null;
    is_komunal: boolean;
    pekerjaan?: Pekerjaan;
    created_at: string;
    updated_at: string;
}

export interface PenerimaFormData {
    pekerjaan_id: number;
    nama: string;
    jumlah_jiwa: number;
    nik: string;
    alamat: string;
    is_komunal: boolean;
}

export interface PenerimaParams {
    page?: number;
    per_page?: number;
    search?: string;
    pekerjaan_id?: number;
    komunal?: boolean;
    tahun?: string;
}

export interface PenerimaResponse {
    data: Penerima[];
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
