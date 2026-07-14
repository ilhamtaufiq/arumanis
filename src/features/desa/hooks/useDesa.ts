import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createResourceHooks } from '@/lib/create-resource-hooks'
import { createDesa, deleteDesa, getDesa, getDesaById, getDesaByKecamatan, syncDesaKk, updateDesa } from '../api/desa'
import type { Desa } from '../types'
import { ApiError } from '@/lib/api-client'

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

export function useSyncDesaKk() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (payload?: { tahun?: number; semester?: number }) => syncDesaKk(payload),
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: desaKeys.all })
            const data = result.data
            toast.success(
                result.message
                || `Sync KK selesai: ${data.updated} desa diperbarui (tahun ${data.tahun} semester ${data.semester}).`
            )
            if (data.unmatched > 0 || data.ambiguous > 0) {
                toast.warning(
                    `${data.unmatched} tidak cocok, ${data.ambiguous} ambigu dari ${data.source_rows} baris sumber.`
                )
            }
        },
        onError: (error) => {
            const message = error instanceof ApiError
                ? error.message
                : 'Gagal sinkronisasi jumlah KK'
            toast.error(message)
        },
    })
}