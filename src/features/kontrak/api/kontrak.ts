import api from '@/lib/api-client';
import type { Kontrak, KontrakResponse, PenyediaResponse } from '../types';

export const getKontrak = async (params?: {
    page?: number;
    pekerjaan_id?: number;
    kegiatan_id?: number;
    penyedia_id?: number;
    search?: string;
    tahun?: string;
}) => {
    let url = '/kontrak';

    if (params?.pekerjaan_id) {
        url = `/kontrak/pekerjaan/${params.pekerjaan_id}`;
    } else if (params?.kegiatan_id) {
        url = `/kontrak/kegiatan/${params.kegiatan_id}`;
    } else if (params?.penyedia_id) {
        url = `/kontrak/penyedia/${params.penyedia_id}`;
    }

    return api.get<KontrakResponse>(url, {
        params: {
            page: params?.page,
            search: params?.search,
            tahun: params?.tahun
        }
    });
};

export const getKontrakById = async (id: number) => {
    return api.get<{ data: Kontrak }>(`/kontrak/${id}`);
};

export const createKontrak = async (data: Omit<Kontrak, 'id' | 'created_at' | 'updated_at' | 'kegiatan' | 'pekerjaan' | 'penyedia'>) => {
    return api.post<{ data: Kontrak }>('/kontrak', data);
};

export const updateKontrak = async (id: number, data: Partial<Omit<Kontrak, 'id' | 'created_at' | 'updated_at' | 'kegiatan' | 'pekerjaan' | 'penyedia'>>) => {
    return api.put<{ data: Kontrak }>(`/kontrak/${id}`, data);
};

export const deleteKontrak = async (id: number) => {
    await api.delete(`/kontrak/${id}`);
};

// Helper function to get penyedia list for dropdowns
export const getPenyedia = async (params?: { page?: number; per_page?: number }) => {
    return api.get<PenyediaResponse>('/penyedia', {
        params: {
            ...params,
            per_page: params?.per_page ?? -1  // Default to all items for dropdown
        }
    });
};
