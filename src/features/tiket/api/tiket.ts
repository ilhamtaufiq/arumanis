import api from '@/lib/api-client';
import type { Tiket, TiketParams, TiketResponse, TiketFormData, TiketAdminUpdateData } from '../types';

export const getTiketList = async (params?: TiketParams) => {
    return api.get<TiketResponse>('/tiket', { params: params as Record<string, string | number | undefined> });
};

export const getTiketById = async (id: number) => {
    return api.get<{ data: Tiket }>(`/tiket/${id}`);
};

export const createTiket = async (data: FormData | TiketFormData) => {
    return api.post<{ data: Tiket }>('/tiket', data);
};

export const updateTiket = async (id: number, data: FormData | TiketFormData | TiketAdminUpdateData) => {
    return api.post<{ data: Tiket }>(`/tiket/${id}?_method=PUT`, data);
};

export const deleteTiket = async (id: number) => {
    await api.delete(`/tiket/${id}`);
};
