import api from '@/lib/api-client';
import type {
    MenuPermission,
    MenuPermissionFormData,
    MenuPermissionParams,
    MenuPermissionResourceResponse,
    MenuPermissionResponse,
    UserMenusResponse
} from '../types';

export const getMenuPermissions = async (params?: MenuPermissionParams) => {
    return api.get<MenuPermissionResponse>('/menu-permissions', { params: params as Record<string, string | number | undefined> });
};

export const getMenuPermission = async (id: number) => {
    const response = await api.get<MenuPermission | MenuPermissionResourceResponse>(`/menu-permissions/${id}`);
    return 'data' in response ? response.data : response;
};

export const createMenuPermission = async (data: MenuPermissionFormData) => {
    const response = await api.post<MenuPermission | MenuPermissionResourceResponse>('/menu-permissions', data);
    return 'data' in response ? response.data : response;
};

export const updateMenuPermission = async ({ id, data }: { id: number; data: MenuPermissionFormData }) => {
    const response = await api.put<MenuPermission | MenuPermissionResourceResponse>(`/menu-permissions/${id}`, data);
    return 'data' in response ? response.data : response;
};

export const deleteMenuPermission = async (id: number) => {
    await api.delete(`/menu-permissions/${id}`);
};

export const getUserMenus = async () => {
    const response = await api.get<UserMenusResponse | undefined>('/menu-permissions/user/menus');
    return {
        allowed_menus: Array.isArray(response?.allowed_menus) ? response.allowed_menus : [],
        configured_menus: Array.isArray(response?.configured_menus) ? response.configured_menus : [],
    };
};

export const getAllMenuPermissions = async () => {
    const permissions: MenuPermission[] = [];
    let page = 1;
    let lastPage = 1;

    do {
        const response = await getMenuPermissions({ page });
        permissions.push(...response.data);
        lastPage = response.meta?.last_page ?? (response as unknown as { last_page?: number }).last_page ?? 1;
        page += 1;
    } while (page <= lastPage);

    return permissions;
};
