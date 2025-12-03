import type { Pekerjaan } from '@/features/pekerjaan/types';

export interface Output {
    id: number;
    pekerjaan_id: number;
    komponen: string;
    satuan: string;
    volume: number;
    penerima_is_optional: boolean;
    pekerjaan?: Pekerjaan;
    created_at: string;
    updated_at: string;
}

export interface OutputResponse {
    data: Output[];
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
