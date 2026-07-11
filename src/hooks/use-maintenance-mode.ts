import { useQuery } from '@tanstack/react-query'
import { getMaintenanceStatus } from '@/features/settings/api'
import {
    isMaintenanceBypassEmail,
    isMaintenanceExemptPath,
    type MaintenanceStatus,
} from '@/features/settings/lib/maintenance'
import { useAuthStore } from '@/stores/auth-stores'

export function useMaintenanceStatus() {
    return useQuery({
        queryKey: ['app-settings-maintenance'],
        queryFn: getMaintenanceStatus,
        staleTime: 30_000,
        refetchInterval: 60_000,
        retry: 1,
    })
}

/**
 * True when SPA should show the maintenance wall (not exempt route, not bypass user).
 */
export function useShouldShowMaintenance(pathname: string): {
    show: boolean
    isLoading: boolean
    status: MaintenanceStatus | undefined
} {
    const { data, isLoading, isError } = useMaintenanceStatus()
    const userEmail = useAuthStore((s) => s.auth.user?.email)

    // On network/API failure, do not hard-lock the app.
    if (isError || !data) {
        return { show: false, isLoading, status: data }
    }

    if (!data.enabled) {
        return { show: false, isLoading: false, status: data }
    }

    if (data.can_access || data.bypass || isMaintenanceBypassEmail(userEmail)) {
        return { show: false, isLoading: false, status: data }
    }

    if (isMaintenanceExemptPath(pathname)) {
        return { show: false, isLoading: false, status: data }
    }

    return { show: true, isLoading: false, status: data }
}
