import type { Role } from '@/features/roles/types';
import type { Permission } from '@/features/permissions/types';

export interface User {
    id: number;
    name: string;
    email: string;
    roles: Role[];
    permissions: Permission[];
    created_at: string;
    updated_at: string;
}

export interface UserFormData {
    name: string;
    email: string;
    password?: string;
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
