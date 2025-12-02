export interface Kegiatan {
    id: number;
    nama_program: string;
    nama_kegiatan: string;
    nama_sub_kegiatan: string;
    tahun_anggaran: string;
    sumber_dana: string;
    pagu: number;
    kode_rekening: string[];
    created_at: string;
    updated_at: string;
}

export interface KegiatanResponse {
    data: Kegiatan[];
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
