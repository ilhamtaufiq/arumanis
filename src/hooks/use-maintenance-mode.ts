import { useQuery } from '@tanstack/react-query'
import type { MaintenanceStatus } from '@/features/settings/lib/maintenance'
import { fetchMaintenanceStatus } from '@/lib/maintenance-session'

/** Poll maintenance status (cache shared with beforeLoad via maintenance-session). */
export function useMaintenanceStatus() {
    return useQuery({
        queryKey: ['app-settings-maintenance'],
        queryFn: async (): Promise<MaintenanceStatus> => {
            return fetchMaintenanceStatus(true)
        },
        staleTime: 15_000,
        refetchInterval: 60_000,
        retry: 1,
    })
}
