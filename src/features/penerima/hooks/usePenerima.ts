import { useQuery } from '@tanstack/react-query'
import { createResourceHooks } from '@/lib/create-resource-hooks'
import {
    createPenerima,
    deletePenerima,
    getPenerima,
    getPenerimaList,
    getPenerimaSummary,
    updatePenerima,
} from '../api'
import type { PenerimaFormData, PenerimaParams } from '../types'

const resource = createResourceHooks<PenerimaParams, PenerimaFormData, { id: number; data: PenerimaFormData }>({
    key: 'penerima',
    listFn: getPenerimaList,
    detailFn: getPenerima,
    createFn: createPenerima,
    updateFn: updatePenerima,
    deleteFn: deletePenerima,
    messages: {
        deleteSuccess: 'Penerima berhasil dihapus',
        deleteError: 'Gagal menghapus penerima',
    },
})

export const penerimaKeys = resource.keys
export const usePenerimaList = resource.useList
export const usePenerimaDetail = resource.useDetail
export const useCreatePenerima = resource.useCreate!
export const useUpdatePenerima = resource.useUpdate!
export const useDeletePenerima = resource.useDelete!

/** Ringkasan stats card di list penerima (filter tahun opsional). */
export function usePenerimaSummary(tahun?: string, enabled = true) {
    return useQuery({
        queryKey: [...penerimaKeys.all, 'summary', tahun ?? 'all'] as const,
        queryFn: () => getPenerimaSummary(tahun ? { tahun } : undefined),
        enabled,
        staleTime: 60_000,
    })
}