import { createResourceHooks } from '@/lib/create-resource-hooks'
import { createKegiatanRole, deleteKegiatanRole, getKegiatanRoles } from '../api'
import type { KegiatanRoleFormData } from '../types'

export type KegiatanRoleListParams = { page?: number }

const resource = createResourceHooks<KegiatanRoleListParams, KegiatanRoleFormData>({
    key: 'kegiatan-role',
    listFn: getKegiatanRoles,
    createFn: createKegiatanRole,
    deleteFn: deleteKegiatanRole,
    messages: {
        deleteSuccess: 'Role kegiatan berhasil dihapus',
        deleteError: 'Gagal menghapus role kegiatan',
    },
})

export const kegiatanRoleKeys = resource.keys
export const useKegiatanRoleList = resource.useList
export const useCreateKegiatanRole = resource.useCreate!
export const useDeleteKegiatanRole = resource.useDelete!