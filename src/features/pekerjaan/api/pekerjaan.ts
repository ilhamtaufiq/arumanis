import apiClient from '@/lib/axios';
import type { Pekerjaan, PekerjaanResponse } from '../types';

export const getPekerjaan = async (params?: { page?: number; kecamatan_id?: number; desa_id?: number; kegiatan_id?: number; search?: string }) => {
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

    const response = await apiClient.get<PekerjaanResponse>(url, { params: { page: params?.page, search: params?.search } });
    return response.data;
};

export const getPekerjaanById = async (id: number) => {
    const response = await apiClient.get<{ data: Pekerjaan }>(`/pekerjaan/${id}`);
    return response.data;
};

export const createPekerjaan = async (data: Omit<Pekerjaan, 'id' | 'created_at' | 'updated_at' | 'kecamatan' | 'desa' | 'kegiatan'>) => {
    const response = await apiClient.post<{ data: Pekerjaan }>('/pekerjaan', data);
    return response.data;
};

export const updatePekerjaan = async (id: number, data: Partial<Omit<Pekerjaan, 'id' | 'created_at' | 'updated_at' | 'kecamatan' | 'desa' | 'kegiatan'>>) => {
    const response = await apiClient.put<{ data: Pekerjaan }>(`/pekerjaan/${id}`, data);
    return response.data;
};

export const deletePekerjaan = async (id: number) => {
    await apiClient.delete(`/pekerjaan/${id}`);
};
