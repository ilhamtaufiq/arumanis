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
    spse_nama_paket?: string | null;
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
    spse_sppbj_id?: string | null;
    spse_spk_id?: string | null;
    spse_rekanan_id?: string | null;
    spse_pushed_at?: string | null;
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
    document_type?: string | null;
    label?: string | null;
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
    created_by?: number | null;
    approved_by?: number | null;
    approved_at?: string | null;
    creator?: { id: number; name: string } | null;
    approver?: { id: number; name: string } | null;
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

export interface KontrakImportResult {
    success_count?: number;
    error_count?: number;
    errors?: Array<{ row?: number; message: string }>;
    message?: string;
}

export interface KontrakBapRegisterSnapshot {
    register_id: number;
    nomor: string;
    tanggal: string;
    nilai?: number | null;
    type_code?: string;
    type_name?: string;
}

export interface KontrakBapAddendumSnapshot {
    id: number;
    addendum_ke: number;
    nomor: string;
    tanggal: string;
    nilai_kontrak_sesudah: number | null;
}

export interface KontrakBapPendingAddendumSnapshot extends KontrakBapAddendumSnapshot {
    status: KontrakAddendum['status'];
}

export interface KontrakBapContext {
    can_generate: boolean;
    missing: string[];
    nilai_kontrak_efektif: number | null;
    nilai_kontrak_awal: number | null;
    bastp: KontrakBapRegisterSnapshot | null;
    addendum: KontrakBapAddendumSnapshot | null;
    addendum_register_gaps?: KontrakAddendumRegisterGap[];
    pending_addendums?: KontrakBapPendingAddendumSnapshot[];
    jaminan_uang_muka: KontrakBapRegisterSnapshot | null;
    uang_muka: KontrakBapRegisterSnapshot | null;
    pekerjaan: { id: number; nama_paket: string } | null;
}

export type RingkasanPersenTagih = 100 | 95 | 5 | 30;

export interface RingkasanPembayaranLaluItem {
    jenis: string;
    tanggal: string;
    nominal: number | '';
}

export interface KontrakRingkasanExportParams {
    persen_tagih?: RingkasanPersenTagih;
    pembayaran_lalu?: Array<{
        jenis?: string;
        tanggal?: string;
        nominal?: number;
    }>;
}

export interface KontrakBapExportParams {
    persen_bap?: number;
    potongan_lima_persen?: number;
    potongan_uang_muka?: number;
    total_potongan?: number;
    tgl_bap?: string;
    nomor_bastp?: string;
    tgl_bastp?: string;
    nomor_spk_addendum?: string;
    tgl_spk_addendum?: string;
    nilai_kontrak_addendum?: number;
    nomor_bap?: string;
    nomor_jaminan_uang_muka?: string;
    tgl_jaminan_uang_muka?: string;
    nomor_uang_muka?: string;
    tgl_uang_muka?: string;
    nominal_uang_muka?: number;
    fisik_persen?: number;
    dpp?: number;
    ppn_persen?: number;
    fisik_persen_total_potongan?: number;
    total_bap?: number;
    kontrak_persen?: number;
    nilai_kontrak?: number;
}

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

export interface KontrakAddendumRegisterGap {
    register_id: number;
    nomor_register: string;
    tanggal_register: string;
    type_code?: string | null;
    type_name?: string | null;
    kontrak_id: number;
    addendum_count: number;
    pekerjaan?: {
        id: number;
        nama_paket: string;
        kode_rekening?: string | null;
    } | null;
    penyedia?: {
        id: number;
        nama: string;
    } | null;
    pengawas?: {
        id: number;
        nama: string;
    } | null;
}

export interface KontrakAddendumRegisterGapResponse {
    total: number;
    items: KontrakAddendumRegisterGap[];
    type_codes: string[];
}

export interface KontrakAddendumPengawasInstructionResult {
    message: string;
    notified_count: number;
    email_sent_count: number;
    recipients: Array<{
        user_id: number;
        name: string;
        email: string | null;
        notification_sent: boolean;
        email_sent: boolean;
        email_skipped_reason: string | null;
    }>;
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
