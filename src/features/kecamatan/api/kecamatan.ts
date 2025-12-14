import api from '@/lib/api-client';
import type { Kecamatan, KecamatanDetail } from '../types';

export const getKecamatan = async () => {
    return api.get<{ data: Kecamatan[] }>('/kecamatan');
};

export const getKecamatanById = async (id: number) => {
    return api.get<{ data: KecamatanDetail }>(`/kecamatan/${id}`);
};

export const createKecamatan = async (data: { n_kec: string }) => {
    return api.post<{ data: Kecamatan }>('/kecamatan', data);
};

export const updateKecamatan = async (id: number, data: { n_kec: string }) => {
    return api.put<{ data: Kecamatan }>(`/kecamatan/${id}`, data);
};

export const deleteKecamatan = async (id: number) => {
    await api.delete(`/kecamatan/${id}`);
};
