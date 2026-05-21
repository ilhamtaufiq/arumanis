import { create } from 'zustand';
import { getNotifications, markAsRead, markAllAsRead, type AppNotification } from '@/features/notifications/api/notifications';

interface NotificationState {
    notifications: AppNotification[];
    unreadCount: number;
    loading: boolean;
    fetchNotifications: (unreadOnly?: boolean) => Promise<void>;
    markRead: (id: string) => Promise<void>;
    markAllRead: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
    notifications: [],
    unreadCount: 0,
    loading: false,

    fetchNotifications: async (unreadOnly = false) => {
        set({ loading: true });
        try {
            const response = await getNotifications(unreadOnly);
            const notificationPayload = response?.notifications;
            const notifications = Array.isArray(notificationPayload)
                ? notificationPayload
                : Array.isArray((notificationPayload as any)?.data)
                    ? (notificationPayload as any).data
                    : [];

            // If it's for the bell (unreadOnly), we replace notifications
            // If it's a general fetch, we might handle it differently but for now simple sync
            set({
                notifications,
                unreadCount: Number(response?.unread_count ?? 0),
                loading: false
            });
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
            set({ loading: false });
        }
    },

    markRead: async (id: string) => {
        try {
            await markAsRead(id);
            const { notifications, unreadCount } = get();
            const updatedNotifications = notifications.map(n =>
                n.id === id ? { ...n, read_at: new Date().toISOString() } : n
            );
            set({
                notifications: updatedNotifications,
                unreadCount: Math.max(0, unreadCount - 1)
            });
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    },

    markAllRead: async () => {
        try {
            await markAllAsRead();
            const { notifications } = get();
            const updatedNotifications = notifications.map(n => ({ ...n, read_at: new Date().toISOString() }));
            set({
                notifications: updatedNotifications,
                unreadCount: 0
            });
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
        }
    }
}));
