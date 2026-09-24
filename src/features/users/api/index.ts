import api from '@/lib/api-client';
import type { User, UserFormData, UserParams, UserResponse } from '../types';

export const getUsers = async (params?: UserParams) => {
    return api.get<UserResponse>('/users', { params: params as Record<string, string | number | undefined> });
};

export const getUser = async (id: number) => {
    return api.get<User>(`/users/${id}`);
};

export const createUser = async (data: UserFormData) => {
    return api.post<User>('/users', data);
};

export const updateUser = async ({ id, data }: { id: number; data: UserFormData }) => {
    return api.put<User>(`/users/${id}`, data);
};

export const deleteUser = async (id: number) => {
    await api.delete(`/users/${id}`);
};

/** Upload avatar file ke profil sendiri (self-service). */
export const uploadMyAvatar = async (file: File): Promise<User> => {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.post<User>('/auth/avatar', formData);
};

/** Hapus avatar upload (kembali ke dicebear/default). */
export const deleteMyAvatar = async (): Promise<User> => {
    return api.delete<User>('/auth/avatar');
};

/** Update profil sendiri — tidak lewat PUT /users/{id} yang admin-only. */
export const updateMyProfile = async (data: Partial<UserFormData>): Promise<User> => {
    return api.put<User>('/auth/profile', data);
};

export const impersonateUser = async (id: number) => {
    const response = await fetch(`/bff/auth/impersonate/${id}`, {
        method: 'POST',
        credentials: 'include',
        headers: { Accept: 'application/json' },
    })

    const payload = await response.json().catch(() => null)
    if (!response.ok) {
        throw new Error(payload?.message || 'Impersonation failed')
    }

    return payload as { user: User; message: string; isImpersonating: boolean }
};
