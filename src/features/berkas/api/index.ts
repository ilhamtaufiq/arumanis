import apiClient from '@/lib/axios';
import type { Berkas, BerkasParams, BerkasResponse } from '../types';

export const getBerkasList = async (params?: BerkasParams) => {
    const response = await apiClient.get<BerkasResponse>('/berkas', { params });
    return response.data;
};

export const getBerkas = async (id: number) => {
    const response = await apiClient.get<{ data: Berkas }>(`/berkas/${id}`);
    return response.data;
};

export const createBerkas = async (data: FormData) => {
    const response = await apiClient.post<{ data: Berkas }>('/berkas', data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const updateBerkas = async ({ id, data }: { id: number; data: FormData }) => {
    // Use POST with _method=PUT for FormData in Laravel
    data.append('_method', 'PUT');
    const response = await apiClient.post<{ data: Berkas }>(`/berkas/${id}`, data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const deleteBerkas = async (id: number) => {
    await apiClient.delete(`/berkas/${id}`);
};
