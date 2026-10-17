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
    npwp?: string;
    bank?: string;
    norek?: string;
    dokumen?: DokumenMedia[];
    whatsapp?: PenyediaWhatsapp[];
    created_at?: string;
    updated_at?: string;
}

export interface PenyediaWhatsapp {
    id: number;
    /** Format internasional tanpa tanda baca, mis. 6281234567890. */
    nomor: string;
    label?: string | null;
}

export interface PenyediaDto {
    nama: string;
    direktur?: string;
    no_akta?: string;
    notaris?: string;
    tanggal_akta?: string;
    alamat?: string;
    npwp?: string;
    bank?: string;
    norek?: string;
    dokumen?: File[];
    delete_dokumen?: number[];
}
