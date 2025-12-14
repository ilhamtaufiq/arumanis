// Progress Report Types

export interface WeeklyProgressData {
    id?: number;
    minggu: number;
    rencana: number;
    realisasi: number | null;
}

export interface ProgressItemData {
    id: number;
    nama_item: string;
    rincian_item: string | null;
    satuan: string;
    harga_satuan: number;
    bobot: number;
    target_volume: number;
    weekly_data: {
        [minggu: number]: {
            rencana: number;
            realisasi: number | null;
        };
    };
}

export interface ProgressReportData {
    pekerjaan: {
        id: number;
        nama: string;
        pagu: number;
        lokasi?: string;
        desa_nama?: string;
        kecamatan_nama?: string;
    };
    kegiatan?: {
        nama_kegiatan: string;
        nama_sub_kegiatan: string;
        sumber_dana: string;
        tahun_anggaran: number;
    } | null;
    kontrak?: {
        tgl_spmk: string | null;
        tgl_spk: string | null;
        tgl_selesai: string | null;
        spk: string | null;
        spmk: string | null;
        nilai_kontrak: number | null;
    } | null;
    penyedia?: {
        nama: string;
        direktur: string;
    } | null;
    items: ProgressItemData[];
    totals: {
        total_bobot: number;
        total_accumulated_real: number;
        total_weighted_progress: number;
    };
    max_minggu: number;
}

export interface ProgressReportResponse {
    success: boolean;
    data: ProgressReportData;
}

export interface CreateProgressItemPayload {
    pekerjaan_id: number;
    nama_item: string;
    rincian_item?: string;
    satuan: string;
    harga_satuan: number;
    bobot: number;
    target_volume: number;
}

export interface StoreWeeklyProgressPayload {
    progress_item_id: number;
    minggu: number;
    rencana: number;
    realisasi: number | null;
}
