import { createResourceHooks } from '@/lib/create-resource-hooks'
import { createPermission, deletePermission, getPermission, getPermissions, updatePermission } from '../api'
import type { PermissionFormData, PermissionParams } from '../types'

const resource = createResourceHooks<PermissionParams, PermissionFormData, { id: number; data: PermissionFormData }>({
    key: 'permissions',
    listFn: getPermissions,
    detailFn: getPermission,
    createFn: createPermission,
    updateFn: updatePermission,
    deleteFn: deletePermission,
    messages: {
        deleteSuccess: 'Permission berhasil dihapus',
        deleteError: 'Gagal menghapus permission',
    },
})

export const permissionKeys = resource.keys
export const usePermissionsList = resource.useList
export const usePermissionDetail = resource.useDetail
export const useCreatePermission = resource.useCreate!
export const useUpdatePermission = resource.useUpdate!
export const useDeletePermission = resource.useDelete!