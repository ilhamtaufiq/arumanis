export interface Kecamatan {
    id: number;
    nama_kecamatan: string;
    jumlah_desa: number;
    created_at: string;
    updated_at: string;
}

export interface KecamatanDetail extends Kecamatan {
    desa: Desa[];
}

export interface Desa {
    id: number;
    nama_desa: string;
    luas: number;
    jumlah_penduduk: number;
    kecamatan_id: number;
    created_at: string;
    updated_at: string;
}

export interface KecamatanResponse {
    data: Kecamatan[];
}
