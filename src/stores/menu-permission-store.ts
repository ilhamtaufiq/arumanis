import { create } from 'zustand';
import { getUserMenus } from '@/features/menu-permissions/api';

interface MenuPermissionState {
    allowedMenus: string[];
    configuredMenus: string[];
    userRoles: string[];
    isLoading: boolean;
    isLoaded: boolean;
    fetchMenuPermissions: () => Promise<void>;
    setUserRoles: (roles: string[]) => void;
    canAccessMenu: (menuKey: string | undefined) => boolean;
}

export const useMenuPermissionStore = create<MenuPermissionState>((set, get) => ({
    allowedMenus: [],
    configuredMenus: [],
    userRoles: [],
    isLoading: false,
    isLoaded: false,

    fetchMenuPermissions: async () => {
        if (get().isLoaded || get().isLoading) return;

        set({ isLoading: true });
        try {
            const response = await getUserMenus();
            set({
                allowedMenus: response.allowed_menus,
                configuredMenus: response.configured_menus,
                isLoaded: true,
            });
        } catch (error) {
            console.error('Failed to fetch menu permissions:', error);
            // On error, deny all menus for non-admin (fail-closed)
            set({ isLoaded: true, allowedMenus: [], configuredMenus: [] });
        } finally {
            set({ isLoading: false });
        }
    },

    setUserRoles: (roles: string[]) => {
        set({ userRoles: roles });
    },

    canAccessMenu: (menuKey: string | undefined) => {
        const { allowedMenus, userRoles } = get();

        // If no menuKey, allow access (backward compatibility)
        if (!menuKey) return true;

        // Admin bypass - admin can access all menus
        if (userRoles.includes('admin')) return true;

        // Deny by default - only allow if menu is in allowedMenus
        return allowedMenus.includes(menuKey);
    },
}));

