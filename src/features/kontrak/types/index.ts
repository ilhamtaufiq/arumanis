import type { Kegiatan } from '@/features/kegiatan/types';
import type { Pekerjaan, DocumentRegister } from '@/features/pekerjaan/types';

export interface Penyedia {
    id: number;
    nama: string;
    direktur: string | null;
    no_akta: string | null;
    notaris: string | null;
    tanggal_akta: string | null;
    alamat: string | null;
    bank: string | null;
    norek: string | null;
    created_at: string;
    updated_at: string;
}

export interface Kontrak {
    id: number;
    kode_rup: string | null;
    kode_paket: string | null;
    nomor_penawaran: string | null;
    tanggal_penawaran: string | null;
    nilai_kontrak: number | null;
    tgl_sppbj: string | null;
    tgl_spk: string | null;
    tgl_spmk: string | null;
    tgl_selesai: string | null;
    sppbj: string | null;
    spk: string | null;
    spmk: string | null;
    id_kegiatan: number | null;
    pekerjaan_ids?: number[];
    id_penyedia: number;
    nilai_kontrak_berjalan?: number | null;
    tgl_selesai_berjalan?: string | null;
    kegiatan?: Kegiatan;
    pekerjaans?: Pekerjaan[];
    penyedia?: Penyedia;
    is_checklist_complete: boolean;
    latest_approved_addendum?: KontrakAddendum | null;
    addendums?: KontrakAddendum[];
    contract_versions?: KontrakVersion[];
    registers?: DocumentRegister[];
    created_at: string;
    updated_at: string;
}

export interface KontrakAddendumItem {
    id?: number;
    nama_item?: string | null;
    spesifikasi_sebelum?: string | null;
    spesifikasi_sesudah?: string | null;
    volume_sebelum?: number | null;
    volume_sesudah?: number | null;
    harga_sebelum?: number | null;
    harga_sesudah?: number | null;
    subtotal_sebelum?: number | null;
    subtotal_sesudah?: number | null;
}

export interface KontrakAddendumAttachment {
    id: number;
    name: string;
    url: string;
    type: string;
    size: number;
}

export interface KontrakAddendum {
    id: number;
    kontrak_id: number;
    addendum_ke: number;
    nomor_addendum: string;
    tanggal_addendum: string;
    jenis_addendum: 'teknis' | 'biaya' | 'waktu' | 'teknis_biaya' | 'lainnya';
    alasan: string | null;
    deskripsi_perubahan: string | null;
    nilai_kontrak_sebelum: number | null;
    nilai_kontrak_sesudah: number | null;
    tgl_selesai_sebelum: string | null;
    tgl_selesai_sesudah: string | null;
    status: 'draft' | 'diajukan' | 'disetujui' | 'ditolak';
    can_submit?: boolean;
    can_edit?: boolean;
    kontrak?: {
        id: number;
        spk: string | null;
        kode_paket: string | null;
        nilai_kontrak: number | null;
        tgl_selesai: string | null;
        pekerjaan?: {
            id: number;
            nama_paket: string;
            kode_rekening: string | null;
        } | null;
        penyedia?: {
            id: number;
            nama: string;
        } | null;
    };
    items?: KontrakAddendumItem[];
    attachments?: KontrakAddendumAttachment[];
    created_at: string;
    updated_at: string;
}

export interface KontrakVersion {
    type: 'utama' | 'addendum';
    id?: number;
    label: string;
    addendum_ke?: number;
    nomor: string | null;
    tanggal: string | null;
    nilai_kontrak: number | null;
    tgl_selesai: string | null;
    status: string;
}

export type KontrakAddendumPayload = {
    addendum_ke: number;
    nomor_addendum?: string | null;
    tanggal_addendum: string;
    jenis_addendum: KontrakAddendum['jenis_addendum'];
    alasan?: string | null;
    deskripsi_perubahan?: string | null;
    nilai_kontrak_sebelum?: number | null;
    nilai_kontrak_sesudah?: number | null;
    tgl_selesai_sebelum?: string | null;
    tgl_selesai_sesudah?: string | null;
    items?: KontrakAddendumItem[];
};

export interface KontrakResponse {
    data: Kontrak[];
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

export interface KontrakAddendumResponse {
    data: KontrakAddendum[];
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

export interface PenyediaResponse {
    data: Penyedia[];
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
