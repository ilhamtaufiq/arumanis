import apiClient from '@/lib/axios';
import type { KegiatanRole, KegiatanRoleFormData, KegiatanRoleResponse } from '../types';

export const getKegiatanRoles = async (params?: { page?: number }) => {
    const response = await apiClient.get<KegiatanRoleResponse>('/kegiatan-role', { params });
    return response.data;
};

export const createKegiatanRole = async (data: KegiatanRoleFormData) => {
    const response = await apiClient.post<KegiatanRole>('/kegiatan-role', data);
    return response.data;
};

export const deleteKegiatanRole = async (id: number) => {
    await apiClient.delete(`/kegiatan-role/${id}`);
};

