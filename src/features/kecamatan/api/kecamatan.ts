import apiClient from '@/lib/axios';
import type { Kecamatan, KecamatanDetail } from '../types';

export const getKecamatan = async () => {
    const response = await apiClient.get<{ data: Kecamatan[] }>('/kecamatan');
    return response.data;
};

export const getKecamatanById = async (id: number) => {
    const response = await apiClient.get<{ data: KecamatanDetail }>(`/kecamatan/${id}`);
    return response.data;
};

export const createKecamatan = async (data: { n_kec: string }) => {
    const response = await apiClient.post<{ data: Kecamatan }>('/kecamatan', data);
    return response.data;
};

export const updateKecamatan = async (id: number, data: { n_kec: string }) => {
    const response = await apiClient.put<{ data: Kecamatan }>(`/kecamatan/${id}`, data);
    return response.data;
};

export const deleteKecamatan = async (id: number) => {
    await apiClient.delete(`/kecamatan/${id}`);
};
