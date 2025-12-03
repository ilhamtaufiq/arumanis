import type { Role } from '@/features/roles/types';
import type { Kegiatan } from '@/features/kegiatan/types';

export interface KegiatanRole {
    id: number;
    role_id: number;
    kegiatan_id: number;
    role: Role;
    kegiatan: Kegiatan;
    created_at: string;
    updated_at: string;
}

export interface KegiatanRoleFormData {
    role_id: number;
    kegiatan_id: number;
}

export interface KegiatanRoleResponse {
    data: KegiatanRole[];
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

