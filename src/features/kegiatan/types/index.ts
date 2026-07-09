export const SUMBER_DANA_OPTIONS = [
    'APBD',
    'APBN',
    'DAU',
    'DAK',
    'DID',
    'Bantuan Provinsi',
    'DBH',
    'SILPA',
    'DBH Pajak Rokok',
    'PAD',
    'DBHCT',
    'DBH Prov',
] as const;

export type SumberDana = (typeof SUMBER_DANA_OPTIONS)[number];

export interface Kegiatan {
    id: number;
    nama_program: string;
    sub_bidang: string | null;
    nama_kegiatan: string;
    nama_sub_kegiatan: string;
    tahun_anggaran: string;
    sumber_dana: string;
    pagu: number;
    kode_rekening: string[];
    nama_pptk?: string | null;
    nip_pptk?: string | null;
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
