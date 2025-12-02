import apiClient from '@/lib/axios';
import type { Desa, DesaResponse } from '../types';

export const getDesa = async (params?: { kecamatan_id?: number; page?: number }) => {
    const response = await apiClient.get<DesaResponse>('/desa', { params });
    return response.data;
};

export const getDesaById = async (id: number) => {
    const response = await apiClient.get<{ data: Desa }>(`/desa/${id}`);
    return response.data;
};

export const getDesaByKecamatan = async (kecamatanId: number) => {
    const response = await apiClient.get<{ data: Desa[] }>(`/desa/kecamatan/${kecamatanId}`);
    return response.data;
};

export const createDesa = async (data: Omit<Desa, 'id' | 'created_at' | 'updated_at' | 'kecamatan'>) => {
    const response = await apiClient.post<{ data: Desa }>('/desa', data);
    return response.data;
};

export const updateDesa = async (id: number, data: Partial<Omit<Desa, 'id' | 'created_at' | 'updated_at' | 'kecamatan'>>) => {
    const response = await apiClient.put<{ data: Desa }>(`/desa/${id}`, data);
    return response.data;
};

export const deleteDesa = async (id: number) => {
    await apiClient.delete(`/desa/${id}`);
};
