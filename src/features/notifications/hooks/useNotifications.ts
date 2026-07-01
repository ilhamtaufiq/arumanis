import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
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
    return useQuery({
        queryKey: notificationKeys.list(unreadOnly, page),
        queryFn: () => getNotifications(unreadOnly, page),
    })
}

export function useUnreadNotifications(pollInterval = 15000) {
    return useQuery({
        queryKey: notificationKeys.unread(),
        queryFn: () => getNotifications(true),
        refetchInterval: pollInterval,
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
    return useQuery({
        queryKey: notificationKeys.broadcastHistory(page),
        queryFn: () => getBroadcastHistory(page),
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