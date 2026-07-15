export type ChecklistContext = 'pekerjaan' | 'post_pekerjaan';

export interface ChecklistItem {
    id: number;
    name: string;
    description: string | null;
    sort_order: number;
    context?: ChecklistContext;
    created_at?: string;
    updated_at?: string;
}

export interface ChecklistStatus {
    is_checked: boolean;
    checked_at: string | null;
    updated_at?: string | null;
    checked_by: number | null;
    checked_by_name?: string | null;
    notes: string | null;
}

export interface PekerjaanChecklist {
    id: number;
    nama_paket: string;
    kegiatan: {
        id: number;
        nama_sub_kegiatan: string;
    } | null;
    checklist: Record<number, ChecklistStatus>;
    last_updated_at?: string | null;
    last_updated_by?: number | null;
    last_updated_by_name?: string | null;
}

export interface PekerjaanChecklistResponse {
    columns: ChecklistItem[];
    data: PekerjaanChecklist[];
    meta: {
        current_page: number;
        from: number;
        last_page: number;
        per_page: number;
        to: number;
        total: number;
    };
}

export interface PekerjaanChecklistParams {
    tahun?: string;
    kegiatan_id?: number;
    search?: string;
    page?: number;
    per_page?: number;
    [key: string]: any;
}

export interface ChecklistHistoryItem {
    id: number;
    pekerjaan_id: number;
    pekerjaan_nama: string | null;
    kegiatan: string | null;
    checklist_item_id: number;
    checklist_item_name: string | null;
    is_checked: boolean;
    notes: string | null;
    user_id: number | null;
    user_name: string | null;
    user_email: string | null;
    created_at: string | null;
}

export interface ChecklistHistoryResponse {
    data: ChecklistHistoryItem[];
    meta: {
        current_page: number;
        from: number | null;
        last_page: number;
        per_page: number;
        to: number | null;
        total: number;
    };
}

export interface ChecklistHistoryParams {
    tahun?: string;
    pekerjaan_id?: number;
    checklist_item_id?: number;
    user_id?: number;
    search?: string;
    page?: number;
    per_page?: number;
}
