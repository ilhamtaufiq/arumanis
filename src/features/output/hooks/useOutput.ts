import { useQuery } from '@tanstack/react-query'
import { createResourceHooks } from '@/lib/create-resource-hooks'
import { createOutput, deleteOutput, getOutput, getOutputById, getOutputSummary, updateOutput } from '../api/output'
import type { Output, OutputParams } from '../types'

const resource = createResourceHooks<OutputParams, Omit<Output, 'id' | 'created_at' | 'updated_at' | 'pekerjaan'>, { id: number; data: Partial<Output> }>({
    key: 'output',
    listFn: getOutput,
    detailFn: getOutputById,
    createFn: createOutput,
    updateFn: ({ id, data }) => updateOutput(id, data),
    deleteFn: deleteOutput,
    messages: {
        deleteSuccess: 'Output berhasil dihapus',
        deleteError: 'Gagal menghapus output',
    },
})

export const outputKeys = resource.keys
export const useOutputList = resource.useList
export const useOutputDetail = resource.useDetail
export const useCreateOutput = resource.useCreate!
export const useUpdateOutput = resource.useUpdate!
export const useDeleteOutput = resource.useDelete!

export function useOutputSummary(tahun?: string, enabled = true) {
    return useQuery({
        queryKey: [...outputKeys.all, 'summary', tahun] as const,
        queryFn: () => getOutputSummary({ tahun }),
        enabled,
    })
}