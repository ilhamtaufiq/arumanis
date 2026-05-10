export interface ChecklistItem {
    id: number;
    name: string;
    description: string | null;
    sort_order: number;
    created_at?: string;
    updated_at?: string;
}

export interface ChecklistStatus {
    is_checked: boolean;
    checked_at: string | null;
    checked_by: number | null;
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
