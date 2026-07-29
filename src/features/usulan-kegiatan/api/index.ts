import api from '@/lib/api-client';
import type { UsulanKegiatan, UsulanKegiatanParams, UsulanKegiatanResponse } from '../types';

export const getUsulanKegiatanList = async (params?: UsulanKegiatanParams) => {
    return api.get<UsulanKegiatanResponse>('/usulan-kegiatan', { params: params as Record<string, string | number | undefined> });
};

export const getUsulanKegiatanById = async (id: number) => {
    return api.get<{ data: UsulanKegiatan }>(`/usulan-kegiatan/${id}`);
};

export const createUsulanKegiatan = async (data: FormData) => {
    return api.post<{ data: UsulanKegiatan }>('/usulan-kegiatan', data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export const updateUsulanKegiatan = async (id: number, data: FormData) => {
    return api.post<{ data: UsulanKegiatan }>(`/usulan-kegiatan/${id}?_method=PUT`, data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export const deleteUsulanKegiatan = async (id: number) => {
    await api.delete(`/usulan-kegiatan/${id}`);
};
