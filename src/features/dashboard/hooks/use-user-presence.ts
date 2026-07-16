import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getOnlineUsers, sendPresenceHeartbeat } from '../api/presence'
import { useAuthStore } from '@/stores/auth-stores'

const HEARTBEAT_INTERVAL_MS = 60_000
const ONLINE_USERS_REFETCH_MS = 60_000

export function usePresenceHeartbeat() {
    const isAuthenticated = useAuthStore((state) => state.auth.isSessionActive)

    useEffect(() => {
        if (!isAuthenticated) return

        let cancelled = false

        const ping = async () => {
            try {
                await sendPresenceHeartbeat()
            } catch {
                // Presence is best-effort; ignore transient network errors.
            }
        }

        void ping()
        const timer = window.setInterval(() => {
            if (!cancelled) void ping()
        }, HEARTBEAT_INTERVAL_MS)

        return () => {
            cancelled = true
            window.clearInterval(timer)
        }
    }, [isAuthenticated])
}

export function useOnlineUsers() {
    const isAuthenticated = useAuthStore((state) => state.auth.isSessionActive)
    const currentUserId = useAuthStore((state) => state.auth.user?.id)

    const query = useQuery({
        queryKey: ['presence', 'online'],
        queryFn: getOnlineUsers,
        enabled: isAuthenticated,
        refetchInterval: ONLINE_USERS_REFETCH_MS,
        staleTime: 15_000,
    })

    const users = query.data?.data ?? []
    const onlineWindowMinutes = query.data?.meta.online_window_minutes ?? 5

    return {
        ...query,
        users,
        onlineWindowMinutes,
        onlineCount: users.length,
        currentUserId,
    }
}