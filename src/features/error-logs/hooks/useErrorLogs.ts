import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getErrorLog, getErrorLogs, reopenErrorLog, resolveErrorLog } from '../api'
import type { ErrorLogParams } from '../types'

export const errorLogKeys = {
    all: ['error-logs'] as const,
    lists: () => [...errorLogKeys.all, 'list'] as const,
    list: (params: ErrorLogParams) => [...errorLogKeys.all, 'list', params] as const,
    detail: (id: number) => [...errorLogKeys.all, 'detail', id] as const,
}

export function useErrorLogsList(params: ErrorLogParams = {}, enabled = true) {
    return useQuery({
        queryKey: errorLogKeys.list(params),
        queryFn: () => getErrorLogs(params),
        enabled,
    })
}

export function useErrorLogDetail(id: number, enabled = true) {
    return useQuery({
        queryKey: errorLogKeys.detail(id),
        queryFn: () => getErrorLog(id),
        enabled: enabled && id > 0,
    })
}

export function useResolveErrorLog() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: resolveErrorLog,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: errorLogKeys.all })
            toast.success('Error ditandai selesai')
        },
        onError: () => toast.error('Gagal menandai error selesai'),
    })
}

export function useReopenErrorLog() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: reopenErrorLog,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: errorLogKeys.all })
            toast.success('Error dibuka ulang')
        },
        onError: () => toast.error('Gagal membuka ulang error'),
    })
}