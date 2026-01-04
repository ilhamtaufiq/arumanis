import api from '@/lib/api-client';
import type { Tag } from '../types';

export interface TagsResponse {
    data: Tag[];
}

export const getTags = async (params?: { search?: string }) => {
    return api.get<TagsResponse>('/tags', { params });
};

export const createTag = async (data: { name: string; color?: string }) => {
    return api.post<{ data: Tag }>('/tags', data);
};

export const updateTag = async (id: number, data: { name?: string; color?: string }) => {
    return api.put<{ data: Tag }>(`/tags/${id}`, data);
};

export const deleteTag = async (id: number) => {
    await api.delete(`/tags/${id}`);
};
