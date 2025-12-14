import api from '@/lib/api-client';
import type { Output, OutputResponse } from '../types';

export const getOutput = async (params?: { page?: number; pekerjaan_id?: number; tahun?: string }) => {
    return api.get<OutputResponse>('/output', { params: params as Record<string, string | number | undefined> });
};

export const getOutputById = async (id: number) => {
    return api.get<{ data: Output }>(`/output/${id}`);
};

export const createOutput = async (data: Omit<Output, 'id' | 'created_at' | 'updated_at' | 'pekerjaan'>) => {
    return api.post<{ data: Output }>('/output', data);
};

export const updateOutput = async (id: number, data: Partial<Omit<Output, 'id' | 'created_at' | 'updated_at' | 'pekerjaan'>>) => {
    return api.put<{ data: Output }>(`/output/${id}`, data);
};

export const deleteOutput = async (id: number) => {
    await api.delete(`/output/${id}`);
};
