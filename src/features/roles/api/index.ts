import apiClient from '@/lib/axios';
import type { Role, RoleFormData, RoleParams, RoleResponse } from '../types';

export const getRoles = async (params?: RoleParams) => {
    const response = await apiClient.get<RoleResponse>('/roles', { params });
    return response.data;
};

export const getRole = async (id: number) => {
    const response = await apiClient.get<Role>(`/roles/${id}`);
    return response.data;
};

export const createRole = async (data: RoleFormData) => {
    const response = await apiClient.post<Role>('/roles', data);
    return response.data;
};

export const updateRole = async ({ id, data }: { id: number; data: RoleFormData }) => {
    const response = await apiClient.put<Role>(`/roles/${id}`, data);
    return response.data;
};

export const deleteRole = async (id: number) => {
    await apiClient.delete(`/roles/${id}`);
};
