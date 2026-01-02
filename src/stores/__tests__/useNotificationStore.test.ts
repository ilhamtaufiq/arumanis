import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act } from 'react'
import { useNotificationStore } from '../useNotificationStore'
import * as notificationApi from '@/features/notifications/api/notifications'

vi.mock('@/features/notifications/api/notifications', () => ({
    getNotifications: vi.fn(),
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
}))

describe('useNotificationStore', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        // Reset store state
        act(() => {
            useNotificationStore.setState({
                notifications: [],
                unreadCount: 0,
                loading: false,
            })
        })
    })

    it('should have initial state', () => {
        const state = useNotificationStore.getState()
        expect(state.notifications).toEqual([])
        expect(state.unreadCount).toBe(0)
        expect(state.loading).toBe(false)
    })

    it('should fetch notifications correctly', async () => {
        const mockResponse = {
            notifications: [{ id: '1', data: { title: 'Test' }, read_at: null, created_at: '' }],
            unread_count: 1
        }
        vi.mocked(notificationApi.getNotifications).mockResolvedValue(mockResponse as any)

        await act(async () => {
            await useNotificationStore.getState().fetchNotifications()
        })

        const state = useNotificationStore.getState()
        expect(state.notifications).toHaveLength(1)
        expect(state.unreadCount).toBe(1)
        expect(state.loading).toBe(false)
    })

    it('should mark a notification as read', async () => {
        const initialNotifications = [{ id: '1', data: { title: 'Test' }, read_at: null, created_at: '' }]
        useNotificationStore.setState({ notifications: initialNotifications as any, unreadCount: 1 })

        vi.mocked(notificationApi.markAsRead).mockResolvedValue({ message: 'Success' })

        await act(async () => {
            await useNotificationStore.getState().markRead('1')
        })

        const state = useNotificationStore.getState()
        expect(state.notifications[0].read_at).not.toBeNull()
        expect(state.unreadCount).toBe(0)
    })

    it('should mark all as read', async () => {
        const initialNotifications = [
            { id: '1', data: { title: 'T1' }, read_at: null },
            { id: '2', data: { title: 'T2' }, read_at: null }
        ]
        useNotificationStore.setState({ notifications: initialNotifications as any, unreadCount: 2 })

        vi.mocked(notificationApi.markAllAsRead).mockResolvedValue({ message: 'Success' })

        await act(async () => {
            await useNotificationStore.getState().markAllRead()
        })

        const state = useNotificationStore.getState()
        expect(state.notifications.every(n => n.read_at !== null)).toBe(true)
        expect(state.unreadCount).toBe(0)
    })
})
