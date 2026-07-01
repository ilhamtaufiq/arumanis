import { createResourceHooks } from '@/lib/create-resource-hooks'
import { createRole, deleteRole, getRole, getRoles, updateRole } from '../api'
import type { RoleFormData, RoleParams } from '../types'

const resource = createResourceHooks<RoleParams, RoleFormData, { id: number; data: RoleFormData }>({
    key: 'roles',
    listFn: getRoles,
    detailFn: getRole,
    createFn: createRole,
    updateFn: updateRole,
    deleteFn: deleteRole,
    messages: {
        deleteSuccess: 'Role berhasil dihapus',
        deleteError: 'Gagal menghapus role',
    },
})

export const roleKeys = resource.keys
export const useRolesList = resource.useList
export const useRoleDetail = resource.useDetail
export const useCreateRole = resource.useCreate!
export const useUpdateRole = resource.useUpdate!
export const useDeleteRole = resource.useDelete!