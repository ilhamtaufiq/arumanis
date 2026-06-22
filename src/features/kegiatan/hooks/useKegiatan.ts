import { createResourceHooks } from '@/lib/create-resource-hooks'
import { createKegiatan, deleteKegiatan, getKegiatan, getKegiatanById, updateKegiatan } from '../api/kegiatan'
import type { Kegiatan } from '../types'

export type KegiatanListParams = { tahun?: string; page?: number }

const resource = createResourceHooks<KegiatanListParams, Omit<Kegiatan, 'id' | 'created_at' | 'updated_at'>, { id: number; data: Partial<Kegiatan> }>({
    key: 'kegiatan',
    listFn: getKegiatan,
    detailFn: getKegiatanById,
    createFn: createKegiatan,
    updateFn: ({ id, data }) => updateKegiatan(id, data),
    deleteFn: deleteKegiatan,
    messages: {
        createSuccess: 'Kegiatan berhasil ditambahkan',
        createError: 'Gagal menambahkan kegiatan',
        updateSuccess: 'Kegiatan berhasil diperbarui',
        updateError: 'Gagal memperbarui kegiatan',
        deleteSuccess: 'Kegiatan berhasil dihapus',
        deleteError: 'Gagal menghapus kegiatan',
    },
})

export const kegiatanKeys = resource.keys
export const useKegiatanList = resource.useList
export const useKegiatanDetail = resource.useDetail
export const useCreateKegiatan = resource.useCreate!
export const useUpdateKegiatan = resource.useUpdate!
export const useDeleteKegiatan = resource.useDelete!