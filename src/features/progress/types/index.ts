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
    };
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
