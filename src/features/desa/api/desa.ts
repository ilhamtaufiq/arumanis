import api from '@/lib/api-client';
import type { Desa, DesaResponse } from '../types';

export const getDesa = async (params?: { kecamatan_id?: number; page?: number }) => {
    return api.get<DesaResponse>('/desa', { params: params as Record<string, string | number | undefined> });
};

export const getDesaById = async (id: number) => {
    return api.get<{ data: Desa }>(`/desa/${id}`);
};

export const getDesaByKecamatan = async (kecamatanId: number) => {
    return api.get<{ data: Desa[] }>(`/desa/kecamatan/${kecamatanId}`);
};

export const createDesa = async (data: Omit<Desa, 'id' | 'created_at' | 'updated_at' | 'kecamatan'>) => {
    return api.post<{ data: Desa }>('/desa', data);
};

export const updateDesa = async (id: number, data: Partial<Omit<Desa, 'id' | 'created_at' | 'updated_at' | 'kecamatan'>>) => {
    return api.put<{ data: Desa }>(`/desa/${id}`, data);
};

export const deleteDesa = async (id: number) => {
    await api.delete(`/desa/${id}`);
};
