import api from '@/lib/api-client';
import type { KegiatanRole, KegiatanRoleFormData, KegiatanRoleResponse } from '../types';

export const getKegiatanRoles = async (params?: { page?: number }) => {
    return api.get<KegiatanRoleResponse>('/kegiatan-role', { params: params as Record<string, string | number | undefined> });
};

export const createKegiatanRole = async (data: KegiatanRoleFormData) => {
    return api.post<KegiatanRole>('/kegiatan-role', data);
};

export const deleteKegiatanRole = async (id: number) => {
    await api.delete(`/kegiatan-role/${id}`);
};
