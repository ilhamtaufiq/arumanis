import api from '@/lib/api-client';
import type {
    MenuPermission,
    MenuPermissionFormData,
    MenuPermissionParams,
    MenuPermissionResponse,
    UserMenusResponse
} from '../types';

export const getMenuPermissions = async (params?: MenuPermissionParams) => {
    return api.get<MenuPermissionResponse>('/menu-permissions', { params: params as Record<string, string | number | undefined> });
};

export const getMenuPermission = async (id: number) => {
    return api.get<MenuPermission>(`/menu-permissions/${id}`);
};

export const createMenuPermission = async (data: MenuPermissionFormData) => {
    return api.post<MenuPermission>('/menu-permissions', data);
};

export const updateMenuPermission = async ({ id, data }: { id: number; data: MenuPermissionFormData }) => {
    return api.put<MenuPermission>(`/menu-permissions/${id}`, data);
};

export const deleteMenuPermission = async (id: number) => {
    await api.delete(`/menu-permissions/${id}`);
};

export const getUserMenus = async () => {
    return api.get<UserMenusResponse>('/menu-permissions/user/menus');
};
