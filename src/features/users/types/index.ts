import type { Role } from '@/features/roles/types';
import type { Permission } from '@/features/permissions/types';

export type UserGender = 'male' | 'female' | 'other';

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    gender?: UserGender | null;
    nip?: string;
    jabatan?: string;
    roles: Role[];
    permissions: Permission[];
    is_protected_from_deletion?: boolean;
    created_at: string;
    updated_at: string;
}

export interface UserFormData {
    name: string;
    email: string;
    password?: string;
    avatar?: string | null;
    gender?: UserGender | null;
    nip?: string;
    jabatan?: string;
    roles?: string[]; // Role names
    permissions?: string[]; // Permission names
}

export interface UserResponse {
    data: User[];
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

export interface UserParams {
    page?: number;
    search?: string;
}
