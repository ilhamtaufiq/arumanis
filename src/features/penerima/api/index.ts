import apiClient from '@/lib/axios';
import type { Penerima, PenerimaFormData, PenerimaParams, PenerimaResponse } from '../types';

export const getPenerimaList = async (params?: PenerimaParams) => {
    const response = await apiClient.get<PenerimaResponse>('/penerima', { params });
    return response.data;
};

export const getPenerima = async (id: number) => {
    const response = await apiClient.get<{ data: Penerima }>(`/penerima/${id}`);
    return response.data;
};

export const createPenerima = async (data: PenerimaFormData) => {
    const response = await apiClient.post<{ data: Penerima }>('/penerima', data);
    return response.data;
};

export const updatePenerima = async ({ id, data }: { id: number; data: PenerimaFormData }) => {
    const response = await apiClient.put<{ data: Penerima }>(`/penerima/${id}`, data);
    return response.data;
};

export const deletePenerima = async (id: number) => {
    await apiClient.delete(`/penerima/${id}`);
};
