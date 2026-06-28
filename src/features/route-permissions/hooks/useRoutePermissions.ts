import { useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createResourceHooks } from '@/lib/create-resource-hooks'
import {
    createRoutePermission,
    deleteRoutePermission,
    getAllRoutePermissions,
    getRoutePermission,
    getRoutePermissionRules,
    getRoutePermissions,
    updateRoutePermission,
} from '../api'
import type { RoutePermissionFormData, RoutePermissionParams } from '../types'

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