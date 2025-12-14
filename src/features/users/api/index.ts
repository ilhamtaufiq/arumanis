import api from '@/lib/api-client';
import type { User, UserFormData, UserParams, UserResponse } from '../types';

export const getUsers = async (params?: UserParams) => {
    return api.get<UserResponse>('/users', { params: params as Record<string, string | number | undefined> });
};

export const getUser = async (id: number) => {
    return api.get<User>(`/users/${id}`);
};

export const createUser = async (data: UserFormData) => {
    return api.post<User>('/users', data);
};

export const updateUser = async ({ id, data }: { id: number; data: UserFormData }) => {
    return api.put<User>(`/users/${id}`, data);
};

export const deleteUser = async (id: number) => {
    await api.delete(`/users/${id}`);
};
