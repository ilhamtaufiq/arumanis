import apiClient from '@/lib/axios';
import type { Foto, FotoParams, FotoResponse } from '../types';

export const getFotoList = async (params?: FotoParams) => {
    const response = await apiClient.get<FotoResponse>('/foto', { params });
    return response.data;
};

export const getFoto = async (id: number) => {
    const response = await apiClient.get<{ data: Foto }>(`/foto/${id}`);
    return response.data;
};

export const createFoto = async (data: FormData) => {
    const response = await apiClient.post<{ data: Foto }>('/foto', data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const updateFoto = async ({ id, data }: { id: number; data: FormData }) => {
    // Use POST with _method=PUT for FormData in Laravel
    data.append('_method', 'PUT');
    const response = await apiClient.post<{ data: Foto }>(`/foto/${id}`, data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const deleteFoto = async (id: number) => {
    await apiClient.delete(`/foto/${id}`);
};
