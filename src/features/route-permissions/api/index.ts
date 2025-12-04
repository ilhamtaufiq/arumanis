import apiClient from '@/lib/axios';
import type {
    RoutePermission,
    RoutePermissionFormData,
    RoutePermissionParams,
    RoutePermissionResponse,
    AccessCheckResponse,
    AccessibleRoute,
    RoutePermissionRule
} from '../types';

export const getRoutePermissions = async (params?: RoutePermissionParams) => {
    const response = await apiClient.get<RoutePermissionResponse>('/route-permissions', { params });
    return response.data;
};

export const getRoutePermission = async (id: number) => {
    const response = await apiClient.get<RoutePermission>(`/route-permissions/${id}`);
    return response.data;
};

export const createRoutePermission = async (data: RoutePermissionFormData) => {
    const response = await apiClient.post<RoutePermission>('/route-permissions', data);
    return response.data;
};

export const updateRoutePermission = async ({ id, data }: { id: number; data: RoutePermissionFormData }) => {
    const response = await apiClient.put<RoutePermission>(`/route-permissions/${id}`, data);
    return response.data;
};

export const deleteRoutePermission = async (id: number) => {
    await apiClient.delete(`/route-permissions/${id}`);
};

export const checkRouteAccess = async (route_path: string, route_method: string = 'GET') => {
    const response = await apiClient.post<AccessCheckResponse>('/route-permissions/check-access', {
        route_path,
        route_method,
    });
    return response.data;
};

export const getAccessibleRoutes = async () => {
    const response = await apiClient.get<AccessibleRoute[]>('/route-permissions/user/accessible');
    return response.data;
};

export const getRoutePermissionRules = async () => {
    const response = await apiClient.get<RoutePermissionRule[]>('/route-permissions/rules');
    return response.data;
};
