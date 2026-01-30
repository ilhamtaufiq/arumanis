export type Pengawas = {
    id: number;
    nama: string;
    nip?: string;
    jabatan?: string;
    telepon?: string;
    jumlah_lokasi: number;
    total_pagu: number;
    created_at: string;
    updated_at: string;
};

export type PengawasDTO = {
    nama: string;
    nip?: string;
    jabatan?: string;
    telepon?: string;
};

export type PengawasResponse = {
    data: Pengawas[];
};

export type PengawasDetailResponse = {
    data: Pengawas;
};

export type PengawasStatistics = {
    total_pengawas: number;
    total_lokasi: number;
    total_pagu: number;
};

export type PengawasStatisticsResponse = {
    data: PengawasStatistics;
};
