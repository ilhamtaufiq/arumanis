import { useCallback } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createResourceHooks } from '@/lib/create-resource-hooks'
import {
    createRoutePermission,
    deleteRoutePermission,
    getAllRoutePermissions,
    getRoutePermission,
    getRoutePermissionRules,
    getRoutePermissions,
    syncRoutePermissions,
    updateRoutePermission,
} from '../api'
import type { RoutePermissionFormData, RoutePermissionParams, RoutePermissionSyncOptions } from '../types'

const resource = createResourceHooks<RoutePermissionParams, RoutePermissionFormData, { id: number; data: RoutePermissionFormData }>({
    key: 'route-permissions',
    listFn: getRoutePermissions,
    detailFn: getRoutePermission,
    createFn: createRoutePermission,
    updateFn: updateRoutePermission,
    deleteFn: deleteRoutePermission,
    messages: {
        deleteSuccess: 'Route permission berhasil dihapus',
        deleteError: 'Gagal menghapus route permission',
    },
})

export const routePermissionKeys = resource.keys
export const useRoutePermissionsList = resource.useList
export const useRoutePermissionDetail = resource.useDetail
export const useCreateRoutePermission = resource.useCreate!
export const useUpdateRoutePermission = resource.useUpdate!
export const useDeleteRoutePermission = resource.useDelete!

export function useAllRoutePermissions(enabled = true) {
    return useQuery({
        queryKey: [...routePermissionKeys.all, 'all'] as const,
        queryFn: getAllRoutePermissions,
        enabled,
    })
}

export const routePermissionRulesQueryKey = [...routePermissionKeys.all, 'rules'] as const

export function useRoutePermissionRules(enabled = true) {
    return useQuery({
        queryKey: routePermissionRulesQueryKey,
        queryFn: getRoutePermissionRules,
        enabled,
    })
}

export function useInvalidateRoutePermissionRules() {
    const queryClient = useQueryClient()

    return useCallback(async () => {
        await queryClient.invalidateQueries({ queryKey: routePermissionRulesQueryKey })
    }, [queryClient])
}

export function useSyncRoutePermissions() {
    const queryClient = useQueryClient()
    const invalidateRoutePermissionRules = useInvalidateRoutePermissionRules()

    return useMutation({
        mutationFn: (options?: RoutePermissionSyncOptions) => syncRoutePermissions(options),
        onSuccess: async (response) => {
            const { scanned, created, removed } = response.data
            const parts = [
                `${created} route baru`,
                `dari ${scanned} route terdaftar`,
            ]
            if (removed > 0) {
                parts.push(`${removed} entri usang dihapus`)
            }

            toast.success(`Sinkron route permission selesai: ${parts.join(', ')}.`)
            await queryClient.invalidateQueries({ queryKey: routePermissionKeys.all })
            await invalidateRoutePermissionRules()
        },
        onError: (error: unknown) => {
            const message =
                (error as { data?: { message?: string }; message?: string })?.data?.message
                || (error as { message?: string })?.message
                || 'Gagal menyinkronkan route permission'
            toast.error(message)
        },
    })
}