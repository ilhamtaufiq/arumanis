export type Pengawas = {
    id: number;
    nama: string;
    nip?: string;
    jabatan?: string;
    telepon?: string;
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
