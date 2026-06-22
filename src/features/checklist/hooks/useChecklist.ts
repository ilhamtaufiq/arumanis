import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
    createChecklistItem,
    deleteChecklistItem,
    getChecklistItems,
    getPekerjaanChecklist,
    reorderChecklistItems,
    toggleChecklist,
    updateChecklistItem,
} from '../api/checklist'
import type { PekerjaanChecklistParams } from '../types'

export const checklistKeys = {
    all: ['checklist'] as const,
    items: () => [...checklistKeys.all, 'items'] as const,
    pekerjaan: (params: PekerjaanChecklistParams) => [...checklistKeys.all, 'pekerjaan', params] as const,
}

export function useChecklistItems() {
    return useQuery({
        queryKey: checklistKeys.items(),
        queryFn: getChecklistItems,
    })
}

export function usePekerjaanChecklist(params: PekerjaanChecklistParams, enabled = true) {
    return useQuery({
        queryKey: checklistKeys.pekerjaan(params),
        queryFn: () => getPekerjaanChecklist(params),
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