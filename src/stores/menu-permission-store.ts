import { create } from 'zustand';
import { getUserMenus } from '@/features/menu-permissions/api';

interface MenuPermissionState {
    allowedMenus: string[];
    configuredMenus: string[];
    userRoles: string[];
    isLoading: boolean;
    isLoaded: boolean;
    loadedUserId: number | null;
    fetchMenuPermissions: (userId?: number) => Promise<void>;
    refreshMenuPermissions: () => Promise<void>;
    invalidateMenuPermissions: () => void;
    setUserRoles: (roles: string[]) => void;
    canAccessMenu: (menuKey: string | undefined) => boolean;
}

export const useMenuPermissionStore = create<MenuPermissionState>((set, get) => ({
    allowedMenus: [],
    configuredMenus: [],
    userRoles: [],
    isLoading: false,
    isLoaded: false,
    loadedUserId: null,

    fetchMenuPermissions: async (userId?: number) => {
        const state = get();
        // Cache valid: sudah dimuat untuk user yang sama — jangan fetch ulang
        // (ini yang sebelumnya menyebabkan skeleton tiap pindah halaman).
        if (state.isLoaded) {
            if (userId === undefined || state.loadedUserId === userId) return;
            // User berganti: reset dulu agar tidak tampilkan menu user lama.
            set({ allowedMenus: [], configuredMenus: [], isLoaded: false, loadedUserId: null });
        }
        if (get().isLoading) return;

        set({ isLoading: true });
        try {
            const response = await getUserMenus();
            set({
                allowedMenus: Array.isArray(response?.allowed_menus) ? response.allowed_menus : [],
                configuredMenus: Array.isArray(response?.configured_menus) ? response.configured_menus : [],
                isLoaded: true,
                loadedUserId: userId ?? get().loadedUserId,
            });
        } catch (error) {
            console.error('Failed to fetch menu permissions:', error);
            // On error, deny all menus for non-admin (fail-closed)
            set({ isLoaded: true, allowedMenus: [], configuredMenus: [], loadedUserId: userId ?? get().loadedUserId });
        } finally {
            set({ isLoading: false });
        }
    },

    refreshMenuPermissions: async () => {
        // Refetch tanpa mengosongkan cache dulu — sidebar tetap tampilkan
        // menu lama selama loading, jadi tidak ada flash skeleton.
        if (get().isLoading) return;

        set({ isLoading: true });
        try {
            const response = await getUserMenus();
            set({
                allowedMenus: Array.isArray(response?.allowed_menus) ? response.allowed_menus : [],
                configuredMenus: Array.isArray(response?.configured_menus) ? response.configured_menus : [],
                isLoaded: true,
            });
        } catch (error) {
            console.error('Failed to refresh menu permissions:', error);
        } finally {
            set({ isLoading: false });
        }
    },

    invalidateMenuPermissions: () => {
        set({
            allowedMenus: [],
            configuredMenus: [],
            isLoaded: false,
            isLoading: false,
            loadedUserId: null,
        });
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
        if (allowedMenus.includes(menuKey)) return true

        // Legacy alias: Asisten AI dipindah dari menuKey "chat" → "asisten-ai"
        if (menuKey === 'asisten-ai' && allowedMenus.includes('chat')) return true

        return false
    },
}));

