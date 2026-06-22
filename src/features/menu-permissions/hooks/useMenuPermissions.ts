import { useQuery } from '@tanstack/react-query'
import { createResourceHooks } from '@/lib/create-resource-hooks'
import {
    createMenuPermission,
    deleteMenuPermission,
    getAllMenuPermissions,
    getMenuPermission,
    getMenuPermissions,
    getUserMenus,
    updateMenuPermission,
} from '../api'
import type { MenuPermissionFormData, MenuPermissionParams } from '../types'

const resource = createResourceHooks<MenuPermissionParams, MenuPermissionFormData, { id: number; data: MenuPermissionFormData }>({
    key: 'menu-permissions',
    listFn: getMenuPermissions,
    detailFn: getMenuPermission,
    createFn: createMenuPermission,
    updateFn: updateMenuPermission,
    deleteFn: deleteMenuPermission,
    messages: {
        deleteSuccess: 'Menu permission berhasil dihapus',
        deleteError: 'Gagal menghapus menu permission',
    },
})

export const menuPermissionKeys = resource.keys
export const useMenuPermissionsList = resource.useList
export const useMenuPermissionDetail = resource.useDetail
export const useCreateMenuPermission = resource.useCreate!
export const useUpdateMenuPermission = resource.useUpdate!
export const useDeleteMenuPermission = resource.useDelete!

export function useAllMenuPermissions(enabled = true) {
    return useQuery({
        queryKey: [...menuPermissionKeys.all, 'all'] as const,
        queryFn: getAllMenuPermissions,
        enabled,
    })
}

export function useUserMenus(enabled = true) {
    return useQuery({
        queryKey: [...menuPermissionKeys.all, 'user-menus'] as const,
        queryFn: getUserMenus,
        enabled,
    })
}