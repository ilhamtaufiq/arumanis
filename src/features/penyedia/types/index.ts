export interface DokumenMedia {
    id: number;
    url: string;
    name: string;
    mime_type: string;
    size: number;
}

export interface Penyedia {
    id: number;
    nama: string;
    direktur?: string;
    no_akta?: string;
    notaris?: string;
    tanggal_akta?: string;
    alamat?: string;
    bank?: string;
    norek?: string;
    dokumen?: DokumenMedia[];
    created_at?: string;
    updated_at?: string;
}

export interface PenyediaDto {
    nama: string;
    direktur?: string;
    no_akta?: string;
    notaris?: string;
    tanggal_akta?: string;
    alamat?: string;
    bank?: string;
    norek?: string;
    dokumen?: File[];
    delete_dokumen?: number[];
}
