import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
    createChecklistItem,
    deleteChecklistItem,
    exportChecklistExcel,
    exportChecklistPdf,
    getChecklistHistory,
    getChecklistItems,
    getPekerjaanChecklist,
    reorderChecklistItems,
    toggleChecklist,
    updateChecklistItem,
} from '../api/checklist'
import type { ChecklistContext, ChecklistHistoryParams, PekerjaanChecklistParams } from '../types'

export const checklistKeys = {
    all: ['checklist'] as const,
    items: () => [...checklistKeys.all, 'items'] as const,
    pekerjaan: (params: PekerjaanChecklistParams) => [...checklistKeys.all, 'pekerjaan', params] as const,
    history: (params: ChecklistHistoryParams) => [...checklistKeys.all, 'history', params] as const,
}

export function useChecklistItems(context: ChecklistContext = 'pekerjaan') {
    return useQuery({
        queryKey: [...checklistKeys.items(), context],
        queryFn: () => getChecklistItems(context),
    })
}

export function usePekerjaanChecklist(params: PekerjaanChecklistParams, enabled = true) {
    return useQuery({
        queryKey: checklistKeys.pekerjaan(params),
        queryFn: () => getPekerjaanChecklist(params),
        enabled,
    })
}

export function useChecklistHistory(params: ChecklistHistoryParams, enabled = true) {
    return useQuery({
        queryKey: checklistKeys.history(params),
        queryFn: () => getChecklistHistory(params),
        enabled,
    })
}

export function useCreateChecklistItem() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: createChecklistItem,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: checklistKeys.all }),
    })
}

export function useUpdateChecklistItem() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: { name?: string; description?: string } }) => updateChecklistItem(id, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: checklistKeys.all }),
    })
}

export function useDeleteChecklistItem() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: deleteChecklistItem,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: checklistKeys.all }),
    })
}

export function useReorderChecklistItems() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: reorderChecklistItems,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: checklistKeys.all }),
    })
}

export function useToggleChecklist() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: toggleChecklist,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: checklistKeys.all }),
    })
}

export function useExportChecklistExcel() {
    return useMutation({
        mutationFn: (params?: PekerjaanChecklistParams) => exportChecklistExcel(params),
    })
}

export function useExportChecklistPdf() {
    return useMutation({
        mutationFn: (params?: PekerjaanChecklistParams) => exportChecklistPdf(params),
    })
}
