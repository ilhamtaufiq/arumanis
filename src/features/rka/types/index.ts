export type RkaJenis = 'murni' | 'parsial';

export interface RkaItem {
    id: number;
    rka_document_id: number;
    kode_rekening: string | null;
    tipe: 'rekening' | 'kelompok' | 'paket' | 'rincian' | string;
    uraian: string;
    sumber_dana: string | null;
    koefisien: string | null;
    satuan: string | null;
    harga: number | null;
    jumlah: number | null;
    jumlah_sebelum: number | null;
    jumlah_setelah: number | null;
    selisih: number | null;
    raw_line: string | null;
    sort_order: number;
}

export interface RkaDocument {
    id: number;
    jenis: RkaJenis;
    nama_file: string;
    nomor_dokumen: string | null;
    tahun_anggaran: string | null;
    program: string | null;
    kegiatan: string | null;
    sub_kegiatan: string | null;
    sumber_pendanaan: string[];
    total_sebelum: number | null;
    total_setelah: number | null;
    total_selisih: number | null;
    items_count?: number;
    items?: RkaItem[];
    created_at: string;
    updated_at: string;
}

export interface RkaResponse {
    data: RkaDocument[];
    meta?: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}
