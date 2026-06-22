import api from "@/lib/api-client";

export interface AppNotification {
    id: string;
    data: {
        title: string;
        message: string;
        url?: string;
        type: 'info' | 'success' | 'warning' | 'error';
        is_banner?: boolean;
    };
    read_at: string | null;
    created_at: string;
}

export interface PaginatedNotifications {
    data: AppNotification[];
    current_page: number;
    last_page: number;
    total: number;
    from: number | null;
    to: number | null;
    per_page?: number;
}

export interface NotificationResponse {
    unread_count: number;
    notifications: AppNotification[] | PaginatedNotifications;
}

export type NotificationListResult = {
    notifications: AppNotification[];
    unread_count: number;
    pagination: PaginatedNotifications | null;
};

function isPaginatedNotifications(
    value: AppNotification[] | PaginatedNotifications
): value is PaginatedNotifications {
    return !Array.isArray(value) && Array.isArray(value?.data);
}

export const getNotifications = async (unreadOnly = false, page = 1): Promise<NotificationListResult> => {
    const response = await api.get<NotificationResponse | undefined>("/notifications", {
        params: {
            unread_only: unreadOnly ? 'true' : 'false',
            ...(unreadOnly ? {} : { page }),
        },
    });

    const notificationsPayload = response?.notifications;
    const unreadCount = Number(response?.unread_count ?? 0);

    if (unreadOnly) {
        const notifications = Array.isArray(notificationsPayload) ? notificationsPayload : [];
        return { notifications, unread_count: unreadCount, pagination: null };
    }

    if (isPaginatedNotifications(notificationsPayload)) {
        return {
            notifications: notificationsPayload.data,
            unread_count: unreadCount,
            pagination: notificationsPayload,
        };
    }

    const notifications = Array.isArray(notificationsPayload) ? notificationsPayload : [];
    return { notifications, unread_count: unreadCount, pagination: null };
};

export const markAsRead = (id: string) => {
    return api.post<{ message: string }>(`/notifications/${id}/read`);
};

export const markAllAsRead = () => {
    return api.post<{ message: string }>("/notifications/mark-all-read");
};