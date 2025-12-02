export interface Desa {
    id: number;
    nama_desa: string;
    luas: number;
    jumlah_penduduk: number;
    kecamatan_id: number;
    kecamatan?: {
        id: number;
        nama_kecamatan: string;
        jumlah_desa: number;
    };
    created_at: string;
    updated_at: string;
}

export interface DesaResponse {
    data: Desa[];
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
