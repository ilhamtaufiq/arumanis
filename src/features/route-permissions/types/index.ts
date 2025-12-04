export interface RoutePermission {
    id: number;
    route_path: string;
    route_method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    description: string | null;
    allowed_roles: string[];
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface RoutePermissionFormData {
    route_path: string;
    route_method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    description?: string;
    allowed_roles: string[];
    is_active?: boolean;
}

export interface RoutePermissionResponse {
    data: RoutePermission[];
    links: {
        first: string;
        last: string;
        prev: string | null;
        next: string | null;
    };
    meta: {
        current_page: number;
        from: number;
        last_page: number;
        links: {
            url: string | null;
            label: string;
            active: boolean;
        }[];
        path: string;
        per_page: number;
        to: number;
        total: number;
    };
}

export interface RoutePermissionParams {
    page?: number;
    search?: string;
    method?: string;
    is_active?: boolean;
}

export interface AccessCheckResponse {
    allowed: boolean;
    allowed_roles?: string[];
    user_roles?: string[];
    message: string;
}

export interface AccessibleRoute {
    route_path: string;
    route_method: string;
}

export interface RoutePermissionRule {
    route_path: string;
    route_method: string;
    allowed_roles: string[];
}
