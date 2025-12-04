export interface MenuPermission {
    id: number;
    menu_key: string;
    menu_label: string;
    menu_parent: string | null;
    allowed_roles: string[];
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface MenuPermissionFormData {
    menu_key: string;
    menu_label: string;
    menu_parent?: string | null;
    allowed_roles?: string[];
    is_active?: boolean;
}

export interface MenuPermissionResponse {
    data: MenuPermission[];
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

export interface MenuPermissionParams {
    page?: number;
    search?: string;
    is_active?: boolean;
}

export interface UserMenusResponse {
    allowed_menus: string[];
    configured_menus: string[];
}
