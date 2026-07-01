import { createResourceHooks } from '@/lib/create-resource-hooks'
import { createKontrak, deleteKontrak, getKontrak, getKontrakById, updateKontrak } from '../api/kontrak'
import type { Kontrak } from '../types'

export type KontrakListParams = {
    page?: number
    pekerjaan_id?: number
    kegiatan_id?: number
    penyedia_id?: number
    search?: string
    tahun?: string
}

const resource = createResourceHooks<
    KontrakListParams,
    Omit<Kontrak, 'id' | 'created_at' | 'updated_at' | 'kegiatan' | 'pekerjaan' | 'penyedia'>,
    { id: number; data: Partial<Omit<Kontrak, 'id' | 'created_at' | 'updated_at' | 'kegiatan' | 'pekerjaan' | 'penyedia'>> }
>({
    key: 'kontrak',
    listFn: getKontrak,
    detailFn: getKontrakById,
    createFn: createKontrak,
    updateFn: ({ id, data }) => updateKontrak(id, data),
    deleteFn: deleteKontrak,
    messages: {
        deleteSuccess: 'Kontrak berhasil dihapus',
        deleteError: 'Gagal menghapus kontrak',
    },
})

export const kontrakKeys = resource.keys
export const useKontrakList = resource.useList
export const useKontrakDetail = resource.useDetail
export const useCreateKontrak = resource.useCreate!
export const useUpdateKontrak = resource.useUpdate!
export const useDeleteKontrak = resource.useDelete!