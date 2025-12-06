import apiClient from '@/lib/axios';
import type { Kontrak, KontrakResponse, PenyediaResponse } from '../types';

export const getKontrak = async (params?: {
    page?: number;
    pekerjaan_id?: number;
    kegiatan_id?: number;
    penyedia_id?: number;
    search?: string;
}) => {
    let url = '/kontrak';

    if (params?.pekerjaan_id) {
        url = `/kontrak/pekerjaan/${params.pekerjaan_id}`;
    } else if (params?.kegiatan_id) {
        url = `/kontrak/kegiatan/${params.kegiatan_id}`;
    } else if (params?.penyedia_id) {
        url = `/kontrak/penyedia/${params.penyedia_id}`;
    }

    const response = await apiClient.get<KontrakResponse>(url, {
        params: {
            page: params?.page,
            search: params?.search
        }
    });
    return response.data;
};

export const getKontrakById = async (id: number) => {
    const response = await apiClient.get<{ data: Kontrak }>(`/kontrak/${id}`);
    return response.data;
};

export const createKontrak = async (data: Omit<Kontrak, 'id' | 'created_at' | 'updated_at' | 'kegiatan' | 'pekerjaan' | 'penyedia'>) => {
    const response = await apiClient.post<{ data: Kontrak }>('/kontrak', data);
    return response.data;
};

export const updateKontrak = async (id: number, data: Partial<Omit<Kontrak, 'id' | 'created_at' | 'updated_at' | 'kegiatan' | 'pekerjaan' | 'penyedia'>>) => {
    const response = await apiClient.put<{ data: Kontrak }>(`/kontrak/${id}`, data);
    return response.data;
};

export const deleteKontrak = async (id: number) => {
    await apiClient.delete(`/kontrak/${id}`);
};

// Helper function to get penyedia list for dropdowns
export const getPenyedia = async (params?: { page?: number }) => {
    const response = await apiClient.get<PenyediaResponse>('/penyedia', { params });
    return response.data;
};
