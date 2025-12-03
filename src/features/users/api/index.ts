import apiClient from '@/lib/axios';
import type { User, UserFormData, UserParams, UserResponse } from '../types';

export const getUsers = async (params?: UserParams) => {
    const response = await apiClient.get<UserResponse>('/users', { params });
    return response.data;
};

export const getUser = async (id: number) => {
    const response = await apiClient.get<User>(`/users/${id}`);
    return response.data;
};

export const createUser = async (data: UserFormData) => {
    const response = await apiClient.post<User>('/users', data);
    return response.data;
};

export const updateUser = async ({ id, data }: { id: number; data: UserFormData }) => {
    const response = await apiClient.put<User>(`/users/${id}`, data);
    return response.data;
};

export const deleteUser = async (id: number) => {
    await apiClient.delete(`/users/${id}`);
};
