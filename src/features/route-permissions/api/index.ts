import api from '@/lib/api-client';
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
    return api.get<RoutePermissionResponse>('/route-permissions', { params: params as Record<string, string | number | undefined> });
};

export const getRoutePermission = async (id: number) => {
    return api.get<RoutePermission>(`/route-permissions/${id}`);
};

export const createRoutePermission = async (data: RoutePermissionFormData) => {
    return api.post<RoutePermission>('/route-permissions', data);
};

export const updateRoutePermission = async ({ id, data }: { id: number; data: RoutePermissionFormData }) => {
    return api.put<RoutePermission>(`/route-permissions/${id}`, data);
};

export const deleteRoutePermission = async (id: number) => {
    await api.delete(`/route-permissions/${id}`);
};

export const checkRouteAccess = async (route_path: string, route_method: string = 'GET') => {
    return api.post<AccessCheckResponse>('/route-permissions/check-access', {
        route_path,
        route_method,
    });
};

export const getAccessibleRoutes = async () => {
    return api.get<AccessibleRoute[]>('/route-permissions/user/accessible');
};

export const getRoutePermissionRules = async () => {
    return api.get<RoutePermissionRule[]>('/route-permissions/rules');
};
