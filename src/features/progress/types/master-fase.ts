export interface MasterFasePekerjaan {
    id: number;
    jenis_proyek: string;
    kode_fase: string;
    nama_fase: string;
    prioritas: number;
    overlap_persen: number;
    durasi_faktor: number;
    keywords: string[];
    deskripsi?: string | null;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}
