import api from '@/lib/api-client';
import { fetchAllPages } from '@/lib/paginated-fetch';
import type { Kegiatan, KegiatanResponse } from '../types';

export const getKegiatan = async (params?: { tahun?: string; page?: number }) => {
    return api.get<KegiatanResponse>('/kegiatan', { params: params as Record<string, string | number | undefined> });
};

export const getAllKegiatan = async (tahun?: string) =>
    fetchAllPages((page) => getKegiatan({ page, tahun }));

export const getKegiatanById = async (id: number) => {
    return api.get<{ data: Kegiatan }>(`/kegiatan/${id}`);
};

export const createKegiatan = async (data: Omit<Kegiatan, 'id' | 'created_at' | 'updated_at'>) => {
    return api.post<{ data: Kegiatan }>('/kegiatan', data);
};

export const updateKegiatan = async (id: number, data: Partial<Kegiatan>) => {
    return api.put<{ data: Kegiatan }>(`/kegiatan/${id}`, data);
};

export const deleteKegiatan = async (id: number) => {
    await api.delete(`/kegiatan/${id}`);
};
