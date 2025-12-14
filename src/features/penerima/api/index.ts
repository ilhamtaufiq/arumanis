import api from '@/lib/api-client';
import type { Penerima, PenerimaFormData, PenerimaParams, PenerimaResponse } from '../types';

export const getPenerimaList = async (params?: PenerimaParams) => {
    return api.get<PenerimaResponse>('/penerima', { params: params as Record<string, string | number | undefined> });
};

export const getPenerima = async (id: number) => {
    return api.get<{ data: Penerima }>(`/penerima/${id}`);
};

export const createPenerima = async (data: PenerimaFormData) => {
    return api.post<{ data: Penerima }>('/penerima', data);
};

export const updatePenerima = async ({ id, data }: { id: number; data: PenerimaFormData }) => {
    return api.put<{ data: Penerima }>(`/penerima/${id}`, data);
};

export const deletePenerima = async (id: number) => {
    await api.delete(`/penerima/${id}`);
};
