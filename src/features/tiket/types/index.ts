import type { Pekerjaan } from "@/features/pekerjaan/types";
import type { User } from "@/features/users/types";

export type TiketKategori = 'bug' | 'request' | 'other';
export type TiketPrioritas = 'low' | 'medium' | 'high';
export type TiketStatus = 'open' | 'pending' | 'closed';

export interface TiketComment {
    id: number;
    tiket_id: number;
    user_id: number;
    user?: User;
    message: string;
    created_at: string;
    updated_at: string;
}

export interface Tiket {
    id: number;
    user_id: number;
    user?: User;
    pekerjaan_id: number | null;
    pekerjaan?: Pekerjaan;
    subjek: string;
    deskripsi: string;
    kategori: TiketKategori;
    prioritas: TiketPrioritas;
    status: TiketStatus;
    admin_notes: string | null;
    comments?: TiketComment[];
    image_url: string | null;
    created_at: string;
    updated_at: string;
}

export interface TiketFormData {
    subjek: string;
    deskripsi: string;
    kategori: TiketKategori;
    prioritas: TiketPrioritas;
    pekerjaan_id?: number | null;
}

export interface TiketAdminUpdateData {
    status?: TiketStatus;
    admin_notes?: string;
}

export interface TiketResponse {
    data: Tiket[];
    meta: {
        current_page: number;
        last_page: number;
        total: number;
        per_page: number;
    };
}

export interface TiketParams {
    page?: number;
    per_page?: number;
    status?: TiketStatus;
    kategori?: TiketKategori;
    pekerjaan_id?: number;
}
