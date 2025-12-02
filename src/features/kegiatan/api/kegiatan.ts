import apiClient from '@/lib/axios';
import type { Kegiatan, KegiatanResponse } from '../types';

export const getKegiatan = async (params?: { tahun?: string; page?: number }) => {
    const response = await apiClient.get<KegiatanResponse>('/kegiatan', { params });
    return response.data;
};

export const getKegiatanById = async (id: number) => {
    const response = await apiClient.get<{ data: Kegiatan }>(`/kegiatan/${id}`);
    return response.data;
};

export const createKegiatan = async (data: Omit<Kegiatan, 'id' | 'created_at' | 'updated_at'>) => {
    const response = await apiClient.post<{ data: Kegiatan }>('/kegiatan', data);
    return response.data;
};

export const updateKegiatan = async (id: number, data: Partial<Kegiatan>) => {
    const response = await apiClient.put<{ data: Kegiatan }>(`/kegiatan/${id}`, data);
    return response.data;
};

export const deleteKegiatan = async (id: number) => {
    await apiClient.delete(`/kegiatan/${id}`);
};
