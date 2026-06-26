import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getChecklistItems } from '@/features/checklist/api/checklist'
import { getPostPekerjaanChecklist, togglePostPekerjaanChecklist } from '../api/post-pekerjaan'
import type { PostPekerjaanParams } from '../types'

export const postPekerjaanKeys = {
    all: ['post-pekerjaan'] as const,
    columns: () => [...postPekerjaanKeys.all, 'columns'] as const,
    list: (params: PostPekerjaanParams) => [...postPekerjaanKeys.all, 'list', params] as const,
}

export function usePostPekerjaanColumns() {
    return useQuery({
        queryKey: postPekerjaanKeys.columns(),
        queryFn: () => getChecklistItems('post_pekerjaan'),
    })
}

export function usePostPekerjaanList(params: PostPekerjaanParams, enabled = true) {
    return useQuery({
        queryKey: postPekerjaanKeys.list(params),
        queryFn: () => getPostPekerjaanChecklist(params),
        enabled,
    })
}

export function useTogglePostPekerjaanChecklist() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: togglePostPekerjaanChecklist,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: postPekerjaanKeys.all })
        },
    })
}