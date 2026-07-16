import { useQuery } from '@tanstack/react-query'
import { getActiveVisitors } from '../api/analytics'
import { useAuthStore } from '@/stores/auth-stores'

const ACTIVE_VISITORS_REFETCH_MS = 60_000

export function useActiveVisitors() {
    const isAuthenticated = useAuthStore((state) => state.auth.isSessionActive)

    const query = useQuery({
        queryKey: ['analytics', 'active-visitors'],
        queryFn: getActiveVisitors,
        enabled: isAuthenticated,
        refetchInterval: ACTIVE_VISITORS_REFETCH_MS,
        staleTime: 15_000,
    })

    const enabled = query.data?.enabled === true
    const disabledReason = query.data?.enabled === false ? query.data.reason : undefined
    const data = enabled ? query.data.data : null

    return {
        ...query,
        enabled,
        disabledReason,
        visitorCount: data?.visitorCount ?? 0,
        viewCount: data?.viewCount ?? 0,
        topPages: data?.topPages ?? [],
        lastUpdatedAt: data?.timestamp ?? null,
    }
}