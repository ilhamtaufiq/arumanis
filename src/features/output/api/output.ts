import apiClient from '@/lib/axios';
import type { Output, OutputResponse } from '../types';

export const getOutput = async (params?: { page?: number; pekerjaan_id?: number }) => {
    const response = await apiClient.get<OutputResponse>('/output', { params });
    return response.data;
};

export const getOutputById = async (id: number) => {
    const response = await apiClient.get<{ data: Output }>(`/output/${id}`);
    return response.data;
};

export const createOutput = async (data: Omit<Output, 'id' | 'created_at' | 'updated_at' | 'pekerjaan'>) => {
    const response = await apiClient.post<{ data: Output }>('/output', data);
    return response.data;
};

export const updateOutput = async (id: number, data: Partial<Omit<Output, 'id' | 'created_at' | 'updated_at' | 'pekerjaan'>>) => {
    const response = await apiClient.put<{ data: Output }>(`/output/${id}`, data);
    return response.data;
};

export const deleteOutput = async (id: number) => {
    await apiClient.delete(`/output/${id}`);
};
