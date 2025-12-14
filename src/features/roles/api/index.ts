import api from '@/lib/api-client';
import type { Role, RoleFormData, RoleParams, RoleResponse } from '../types';

export const getRoles = async (params?: RoleParams) => {
    return api.get<RoleResponse>('/roles', { params: params as Record<string, string | number | undefined> });
};

export const getRole = async (id: number) => {
    return api.get<Role>(`/roles/${id}`);
};

export const createRole = async (data: RoleFormData) => {
    return api.post<Role>('/roles', data);
};

export const updateRole = async ({ id, data }: { id: number; data: RoleFormData }) => {
    return api.put<Role>(`/roles/${id}`, data);
};

export const deleteRole = async (id: number) => {
    await api.delete(`/roles/${id}`);
};
