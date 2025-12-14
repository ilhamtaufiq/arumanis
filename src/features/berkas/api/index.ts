import api from '@/lib/api-client';
import type { Berkas, BerkasParams, BerkasResponse } from '../types';

export const getBerkasList = async (params?: BerkasParams) => {
    return api.get<BerkasResponse>('/berkas', { params: params as Record<string, string | number | undefined> });
};

export const getBerkas = async (id: number) => {
    return api.get<{ data: Berkas }>(`/berkas/${id}`);
};

export const createBerkas = async (data: FormData) => {
    return api.post<{ data: Berkas }>('/berkas', data);
};

export const updateBerkas = async ({ id, data }: { id: number; data: FormData }) => {
    // Use POST with _method=PUT for FormData in Laravel
    data.append('_method', 'PUT');
    return api.post<{ data: Berkas }>(`/berkas/${id}`, data);
};

export const deleteBerkas = async (id: number) => {
    await api.delete(`/berkas/${id}`);
};
