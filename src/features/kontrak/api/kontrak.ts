import api from '@/lib/api-client';
import type { Kontrak, KontrakAddendum, KontrakAddendumPayload, KontrakAddendumResponse, KontrakResponse, PenyediaResponse } from '../types';

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

export const getKontrakAddendums = async (kontrakId: number) => {
    return api.get<{ data: KontrakAddendum[] }>(`/kontrak/${kontrakId}/addendums`);
};

export const getAllKontrakAddendums = async (params?: {
    page?: number;
    search?: string;
    status?: string;
}) => {
    return api.get<KontrakAddendumResponse>('/kontrak-addendums', { params });
};

export const createKontrakAddendum = async (kontrakId: number, data: KontrakAddendumPayload) => {
    return api.post<{ data: KontrakAddendum }>(`/kontrak/${kontrakId}/addendums`, data);
};

export const updateKontrakAddendum = async (id: number, data: Partial<KontrakAddendumPayload>) => {
    return api.put<{ data: KontrakAddendum }>(`/kontrak-addendums/${id}`, data);
};

export const deleteKontrakAddendum = async (id: number) => {
    await api.delete(`/kontrak-addendums/${id}`);
};

export const submitKontrakAddendum = async (id: number) => {
    return api.post<{ data: KontrakAddendum }>(`/kontrak-addendums/${id}/submit`);
};

export const approveKontrakAddendum = async (id: number, data: { nomor_addendum: string }) => {
    return api.post<{ data: KontrakAddendum }>(`/kontrak-addendums/${id}/approve`, data);
};

export const rejectKontrakAddendum = async (id: number) => {
    return api.post<{ data: KontrakAddendum }>(`/kontrak-addendums/${id}/reject`);
};

export const uploadKontrakAddendum = async (id: number, formData: FormData) => {
    return api.post<{ data: KontrakAddendum }>(`/kontrak-addendums/${id}/upload`, formData);
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

export const importKontrak = async (formData: FormData) => {
    return api.post('/kontrak/import', formData);
};

export const downloadKontrakTemplate = async (tahun?: string) => {
    const blob = await api.get<Blob>('/kontrak/import/template', {
        params: { tahun },
        responseType: 'blob'
    });
    return blob;
};

export const exportKontrakDoc = async (id: number) => {
    const blob = await api.get<Blob>(`/kontrak/${id}/export`, {
        responseType: 'blob'
    });
    return blob;
};

export const exportKontrakRingkasan = async (id: number) => {
    const blob = await api.get<Blob>(`/kontrak/${id}/export-ringkasan`, {
        responseType: 'blob'
    });
    return blob;
};

export const exportKontrakCover = async (id: number) => {
    const blob = await api.get<Blob>(`/kontrak/${id}/export-cover`, {
        responseType: 'blob'
    });
    return blob;
};

export const exportKontrakBAP = async (id: number, params: any = {}) => {
    const blob = await api.get<Blob>(`/kontrak/${id}/export-bap`, {
        params,
        responseType: 'blob'
    });
    return blob;
};


