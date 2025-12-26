import api from '@/lib/api-client';
import type { Pekerjaan, PekerjaanResponse } from '../types';

export const getPekerjaan = async (params?: { page?: number; kecamatan_id?: number; desa_id?: number; kegiatan_id?: number; search?: string; tahun?: string; per_page?: number }) => {
    // If we have specific filters, we might want to use the specific endpoints or just pass params to the main endpoint if it supports them.
    // The controller has specific endpoints for filters, but index() doesn't seem to filter by params other than page.
    // However, usually index endpoints might support filters. Let's check the controller again.
    // Controller index() just does: Pekerjaan::with(...)->paginate(20). It DOES NOT filter.
    // So we must use the specific endpoints if filters are present.

    let url = '/pekerjaan';

    if (params?.kecamatan_id && params?.desa_id) {
        url = `/pekerjaan/kecamatan/${params.kecamatan_id}/desa/${params.desa_id}`;
    } else if (params?.kecamatan_id) {
        url = `/pekerjaan/kecamatan/${params.kecamatan_id}`;
    } else if (params?.desa_id) {
        url = `/pekerjaan/desa/${params.desa_id}`;
    } else if (params?.kegiatan_id) {
        url = `/pekerjaan/kegiatan/${params.kegiatan_id}`;
    }

    return api.get<PekerjaanResponse>(url, {
        params: {
            page: params?.page,
            search: params?.search,
            tahun: params?.tahun,
            per_page: params?.per_page
        }
    });
};

export const getPekerjaanById = async (id: number) => {
    return api.get<{ data: Pekerjaan }>(`/pekerjaan/${id}`);
};

export const createPekerjaan = async (data: Omit<Pekerjaan, 'id' | 'created_at' | 'updated_at' | 'kecamatan' | 'desa' | 'kegiatan'>) => {
    return api.post<{ data: Pekerjaan }>('/pekerjaan', data);
};

export const updatePekerjaan = async (id: number, data: Partial<Omit<Pekerjaan, 'id' | 'created_at' | 'updated_at' | 'kecamatan' | 'desa' | 'kegiatan'>>) => {
    return api.put<{ data: Pekerjaan }>(`/pekerjaan/${id}`, data);
};

export const deletePekerjaan = async (id: number) => {
    await api.delete(`/pekerjaan/${id}`);
};

export const importPekerjaan = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/pekerjaan/import', formData);
};

export const downloadPekerjaanTemplate = async () => {
    const data = await api.get<Blob>('/pekerjaan/import/template', {
        responseType: 'blob',
    });
    const url = window.URL.createObjectURL(data);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'template_import_pekerjaan.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
};
