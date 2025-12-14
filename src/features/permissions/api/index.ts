import api from '@/lib/api-client';
import type { Permission, PermissionFormData, PermissionParams, PermissionResponse } from '../types';

export const getPermissions = async (params?: PermissionParams) => {
    return api.get<PermissionResponse>('/permissions', { params: params as Record<string, string | number | undefined> });
};

export const getPermission = async (id: number) => {
    return api.get<Permission>(`/permissions/${id}`);
};

export const createPermission = async (data: PermissionFormData) => {
    return api.post<Permission>('/permissions', data);
};

export const updatePermission = async ({ id, data }: { id: number; data: PermissionFormData }) => {
    return api.put<Permission>(`/permissions/${id}`, data);
};

export const deletePermission = async (id: number) => {
    await api.delete(`/permissions/${id}`);
};
