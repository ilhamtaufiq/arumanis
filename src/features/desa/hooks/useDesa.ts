import { useQuery } from '@tanstack/react-query'
import { createResourceHooks } from '@/lib/create-resource-hooks'
import { createDesa, deleteDesa, getDesa, getDesaById, getDesaByKecamatan, updateDesa } from '../api/desa'
import type { Desa } from '../types'

export type DesaListParams = { kecamatan_id?: number; page?: number }

const resource = createResourceHooks<DesaListParams, Omit<Desa, 'id' | 'created_at' | 'updated_at' | 'kecamatan'>, { id: number; data: Partial<Omit<Desa, 'id' | 'created_at' | 'updated_at' | 'kecamatan'>> }>({
    key: 'desa',
    listFn: getDesa,
    detailFn: getDesaById,
    createFn: createDesa,
    updateFn: ({ id, data }) => updateDesa(id, data),
    deleteFn: deleteDesa,
    messages: {
        createSuccess: 'Desa berhasil ditambahkan',
        createError: 'Gagal menambahkan desa',
        updateSuccess: 'Desa berhasil diperbarui',
        updateError: 'Gagal memperbarui desa',
        deleteSuccess: 'Desa berhasil dihapus',
        deleteError: 'Gagal menghapus desa',
    },
})

export const desaKeys = resource.keys
export const useDesaList = resource.useList
export const useDesaDetail = resource.useDetail
export const useCreateDesa = resource.useCreate!
export const useUpdateDesa = resource.useUpdate!
export const useDeleteDesa = resource.useDelete!

export function useDesaByKecamatan(kecamatanId: number, enabled = true) {
    return useQuery({
        queryKey: [...desaKeys.all, 'by-kecamatan', kecamatanId] as const,
        queryFn: () => getDesaByKecamatan(kecamatanId),
        enabled: enabled && kecamatanId > 0,
    })
}