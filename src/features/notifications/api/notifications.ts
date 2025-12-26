import api from "@/lib/api-client";

export interface AppNotification {
    id: string;
    data: {
        title: string;
        message: string;
        url?: string;
        type: 'info' | 'success' | 'warning' | 'error';
    };
    read_at: string | null;
    created_at: string;
}

export interface NotificationResponse {
    unread_count: number;
    notifications: AppNotification[];
}

export const getNotifications = (unreadOnly = false) => {
    return api.get<NotificationResponse>("/notifications", {
        params: { unread_only: unreadOnly ? 'true' : 'false' }
    });
};

export const markAsRead = (id: string) => {
    return api.post<{ message: string }>(`/notifications/${id}/read`);
};

export const markAllAsRead = () => {
    return api.post<{ message: string }>("/notifications/mark-all-read");
};
