import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ApiError } from '@/lib/api-client'
import { isEchoEnabled } from '@/lib/echo'
import { useAuthStore } from '@/stores/auth-stores'
import {
    deleteBroadcast,
    getBroadcastHistory,
    sendBroadcastNotification,
    type BroadcastNotificationData,
} from '../api/broadcast'
import {
    getNotifications,
    markAllAsRead,
    markAsRead,
    type AppNotification,
    type PaginatedNotifications,
} from '../api/notifications'

/**
 * Poll only when WebSocket (Reverb/Echo) is not configured.
 * With Echo enabled, badge updates come from useRealtimeNotifications.
 */
export const UNREAD_NOTIFICATIONS_POLL_MS = 60_000
/** Rare safety net when WS is on (missed events / reconnect gaps). */
export const UNREAD_NOTIFICATIONS_WS_BACKUP_POLL_MS = 5 * 60_000

export const notificationKeys = {
    all: ['notifications'] as const,
    list: (unreadOnly: boolean, page: number) =>
        [...notificationKeys.all, 'list', { unreadOnly, page }] as const,
    unread: () => [...notificationKeys.all, 'unread'] as const,
    broadcastHistory: (page: number) => ['broadcast-history', page] as const,
}

type NotificationListResult = {
    notifications: AppNotification[]
    unreadCount: number
    pagination: PaginatedNotifications | null
}

export function useNotificationList(unreadOnly = false, page = 1) {
    const isSessionActive = useAuthStore((state) => state.auth.isSessionActive)

    return useQuery({
        queryKey: notificationKeys.list(unreadOnly, page),
        queryFn: () => getNotifications(unreadOnly, page),
        enabled: isSessionActive,
        retry: (failureCount, error) => {
            if (error instanceof ApiError && [401, 403].includes(error.status)) {
                return false
            }
            return failureCount < 2
        },
    })
}

export function useUnreadNotifications(pollInterval?: number) {
    const isSessionActive = useAuthStore((state) => state.auth.isSessionActive)
    const realtime = isEchoEnabled()
    const effectivePoll =
        pollInterval ??
        (realtime ? UNREAD_NOTIFICATIONS_WS_BACKUP_POLL_MS : UNREAD_NOTIFICATIONS_POLL_MS)

    return useQuery({
        queryKey: notificationKeys.unread(),
        queryFn: () => getNotifications(true),
        enabled: isSessionActive,
        // WS path: rare backup poll only. HTTP path: moderate poll for badge.
        refetchInterval: (query) => {
            if (!isSessionActive) return false
            const status = query.state.error instanceof ApiError
                ? query.state.error.status
                : undefined
            if (status === 401 || status === 403) return false
            return effectivePoll
        },
        refetchIntervalInBackground: false,
        refetchOnWindowFocus: true,
        staleTime: realtime ? 60_000 : Math.min(effectivePoll, 30_000),
        retry: (failureCount, error) => {
            if (error instanceof ApiError && [401, 403].includes(error.status)) {
                return false
            }
            return failureCount < 2
        },
    })
}

export function useMarkNotificationRead() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: markAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: notificationKeys.all })
        },
        onError: () => {
            toast.error('Gagal menandai notifikasi sebagai dibaca')
        },
    })
}

export function useMarkAllNotificationsRead() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: markAllAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: notificationKeys.all })
            toast.success('Semua notifikasi ditandai dibaca')
        },
        onError: () => {
            toast.error('Gagal menandai semua notifikasi')
        },
    })
}

export function useBroadcastHistory(page = 1) {
    const isSessionActive = useAuthStore((state) => state.auth.isSessionActive)

    return useQuery({
        queryKey: notificationKeys.broadcastHistory(page),
        queryFn: () => getBroadcastHistory(page),
        enabled: isSessionActive,
    })
}

export function useSendBroadcast() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: BroadcastNotificationData) => sendBroadcastNotification(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['broadcast-history'] })
            toast.success('Notifikasi berhasil dikirim')
        },
        onError: (error: { response?: { data?: { message?: string } } }) => {
            toast.error(error.response?.data?.message || 'Gagal mengirim notifikasi')
        },
    })
}

export function useDeleteBroadcast() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => deleteBroadcast(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['broadcast-history'] })
            toast.success('Broadcast berhasil dihapus')
        },
        onError: (error: { response?: { data?: { message?: string } } }) => {
            toast.error(error.response?.data?.message || 'Gagal menghapus broadcast')
        },
    })
}

export function extractNotificationList(data?: NotificationListResult) {
    return data?.notifications ?? []
}
