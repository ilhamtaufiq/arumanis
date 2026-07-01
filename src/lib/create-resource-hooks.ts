import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export type ResourceMessages = {
    createSuccess?: string
    createError?: string
    updateSuccess?: string
    updateError?: string
    deleteSuccess?: string
    deleteError?: string
}

export function createResourceKeys(resourceKey: string) {
    const all = [resourceKey] as const

    return {
        all,
        lists: () => [...all, 'list'] as const,
        list: (params: unknown) => [...all, 'list', params] as const,
        details: () => [...all, 'detail'] as const,
        detail: (id: number) => [...all, 'detail', id] as const,
    }
}

type ResourceHooksConfig<TListParams, TCreate, TUpdate> = {
    key: string
    listFn: (params: TListParams) => Promise<unknown>
    detailFn?: (id: number) => Promise<unknown>
    createFn?: (data: TCreate) => Promise<unknown>
    updateFn?: (input: TUpdate) => Promise<unknown>
    deleteFn?: (id: number) => Promise<void>
    messages?: ResourceMessages
    showToasts?: boolean
}

export function createResourceHooks<TListParams = Record<string, never>, TCreate = unknown, TUpdate = unknown>(
    config: ResourceHooksConfig<TListParams, TCreate, TUpdate>,
) {
    const keys = createResourceKeys(config.key)
    const showToasts = config.showToasts !== false

    function useList(params?: TListParams, enabled = true) {
        const resolvedParams = (params ?? {}) as TListParams

        return useQuery({
            queryKey: keys.list(resolvedParams),
            queryFn: () => config.listFn(resolvedParams),
            enabled,
        })
    }

    function useDetail(id: number, enabled = true) {
        return useQuery({
            queryKey: keys.detail(id),
            queryFn: () => config.detailFn!(id),
            enabled: enabled && id > 0 && !!config.detailFn,
        })
    }

    function useCreate() {
        const queryClient = useQueryClient()

        return useMutation({
            mutationFn: (data: TCreate) => config.createFn!(data),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: keys.all })
                if (showToasts && config.messages?.createSuccess) {
                    toast.success(config.messages.createSuccess)
                }
            },
            onError: () => {
                if (showToasts && config.messages?.createError) {
                    toast.error(config.messages.createError)
                }
            },
        })
    }

    function useUpdate() {
        const queryClient = useQueryClient()

        return useMutation({
            mutationFn: (input: TUpdate) => config.updateFn!(input),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: keys.all })
                if (showToasts && config.messages?.updateSuccess) {
                    toast.success(config.messages.updateSuccess)
                }
            },
            onError: () => {
                if (showToasts && config.messages?.updateError) {
                    toast.error(config.messages.updateError)
                }
            },
        })
    }

    function useDelete() {
        const queryClient = useQueryClient()

        return useMutation({
            mutationFn: (id: number) => config.deleteFn!(id),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: keys.all })
                if (showToasts && config.messages?.deleteSuccess) {
                    toast.success(config.messages.deleteSuccess)
                }
            },
            onError: () => {
                if (showToasts && config.messages?.deleteError) {
                    toast.error(config.messages.deleteError)
                }
            },
        })
    }

    return {
        keys,
        useList,
        useDetail,
        useCreate: config.createFn ? useCreate : undefined,
        useUpdate: config.updateFn ? useUpdate : undefined,
        useDelete: config.deleteFn ? useDelete : undefined,
    }
}