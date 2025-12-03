import type { Pekerjaan } from '@/features/pekerjaan/types';

export interface Berkas {
    id: number;
    pekerjaan_id: number;
    jenis_dokumen: string;
    berkas_url: string;
    pekerjaan?: Pekerjaan;
    created_at: string;
    updated_at: string;
}

export interface BerkasFormData {
    pekerjaan_id: number;
    jenis_dokumen: string;
    file: File | null;
}

export interface BerkasParams {
    page?: number;
    search?: string;
    pekerjaan_id?: number;
}

export interface BerkasResponse {
    data: Berkas[];
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
