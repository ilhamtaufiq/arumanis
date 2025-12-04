import apiClient from '@/lib/axios';
import type {
    MenuPermission,
    MenuPermissionFormData,
    MenuPermissionParams,
    MenuPermissionResponse,
    UserMenusResponse
} from '../types';

export const getMenuPermissions = async (params?: MenuPermissionParams) => {
    const response = await apiClient.get<MenuPermissionResponse>('/menu-permissions', { params });
    return response.data;
};

export const getMenuPermission = async (id: number) => {
    const response = await apiClient.get<MenuPermission>(`/menu-permissions/${id}`);
    return response.data;
};

export const createMenuPermission = async (data: MenuPermissionFormData) => {
    const response = await apiClient.post<MenuPermission>('/menu-permissions', data);
    return response.data;
};

export const updateMenuPermission = async ({ id, data }: { id: number; data: MenuPermissionFormData }) => {
    const response = await apiClient.put<MenuPermission>(`/menu-permissions/${id}`, data);
    return response.data;
};

export const deleteMenuPermission = async (id: number) => {
    await apiClient.delete(`/menu-permissions/${id}`);
};

export const getUserMenus = async () => {
    const response = await apiClient.get<UserMenusResponse>('/menu-permissions/user/menus');
    return response.data;
};
