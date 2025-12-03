import apiClient from '@/lib/axios';
import type { Permission, PermissionFormData, PermissionParams, PermissionResponse } from '../types';

export const getPermissions = async (params?: PermissionParams) => {
    const response = await apiClient.get<PermissionResponse>('/permissions', { params });
    return response.data;
};

export const getPermission = async (id: number) => {
    const response = await apiClient.get<Permission>(`/permissions/${id}`);
    return response.data;
};

export const createPermission = async (data: PermissionFormData) => {
    const response = await apiClient.post<Permission>('/permissions', data);
    return response.data;
};

export const updatePermission = async ({ id, data }: { id: number; data: PermissionFormData }) => {
    const response = await apiClient.put<Permission>(`/permissions/${id}`, data);
    return response.data;
};

export const deletePermission = async (id: number) => {
    await apiClient.delete(`/permissions/${id}`);
};
