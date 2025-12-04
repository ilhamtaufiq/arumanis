import { create } from 'zustand';
import { getUserMenus } from '@/features/menu-permissions/api';

interface MenuPermissionState {
    allowedMenus: string[];
    configuredMenus: string[];
    isLoading: boolean;
    isLoaded: boolean;
    fetchMenuPermissions: () => Promise<void>;
    canAccessMenu: (menuKey: string | undefined) => boolean;
}

export const useMenuPermissionStore = create<MenuPermissionState>((set, get) => ({
    allowedMenus: [],
    configuredMenus: [],
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
            // On error, allow all menus (fail-open)
            set({ isLoaded: true });
        } finally {
            set({ isLoading: false });
        }
    },

    canAccessMenu: (menuKey: string | undefined) => {
        const { configuredMenus, allowedMenus } = get();

        // If no menuKey, allow access (backward compatibility)
        if (!menuKey) return true;

        // If menu is not configured in permissions, allow access (default-allow policy)
        if (!configuredMenus.includes(menuKey)) return true;

        // If menu is configured, check if user has access
        return allowedMenus.includes(menuKey);
    },
}));
