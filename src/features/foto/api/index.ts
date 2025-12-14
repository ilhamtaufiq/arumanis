import api from '@/lib/api-client';
import type { Foto, FotoParams, FotoResponse } from '../types';

export const getFotoList = async (params?: FotoParams) => {
    return api.get<FotoResponse>('/foto', { params: params as Record<string, string | number | undefined> });
};

export const getFoto = async (id: number) => {
    return api.get<{ data: Foto }>(`/foto/${id}`);
};

export const createFoto = async (data: FormData) => {
    return api.post<{ data: Foto }>('/foto', data);
};

export const updateFoto = async ({ id, data }: { id: number; data: FormData }) => {
    // Use POST with _method=PUT for FormData in Laravel
    data.append('_method', 'PUT');
    return api.post<{ data: Foto }>(`/foto/${id}`, data);
};

export const deleteFoto = async (id: number) => {
    await api.delete(`/foto/${id}`);
};
