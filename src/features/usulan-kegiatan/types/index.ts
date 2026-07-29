import type { User } from "@/features/users/types";
import type { Kecamatan, Desa } from "@/features/kecamatan/types";

export interface UsulanKegiatan {
    id: number;
    user_id: number;
    user?: User;
    sub_bidang: 'air minum' | 'sanitasi';
    nama_pengusul: string;
    kecamatan_id: number;
    kecamatan?: Kecamatan;
    desa_id: number;
    desa?: Desa;
    perihal: string;
    ringkasan: string;
    dokumen_url: string | null;
    created_at: string;
    updated_at: string;
}

export interface UsulanKegiatanFormData {
    sub_bidang: 'air minum' | 'sanitasi';
    nama_pengusul: string;
    kecamatan_id: number;
    desa_id: number;
    perihal: string;
    ringkasan: string;
    dokumen?: File | null;
}

export interface UsulanKegiatanResponse {
    data: UsulanKegiatan[];
    meta: {
        current_page: number;
        last_page: number;
        total: number;
        per_page: number;
    };
}

export interface UsulanKegiatanParams {
    page?: number;
    per_page?: number;
    search?: string;
    sub_bidang?: 'air minum' | 'sanitasi';
    kecamatan_id?: number;
    desa_id?: number;
}
