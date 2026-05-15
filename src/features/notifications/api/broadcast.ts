import api from "@/lib/api-client";

export interface BroadcastNotificationData {
    title: string;
    message: string;
    type: 'all' | 'single' | 'multiple';
    user_ids?: number[];
    notification_type?: 'info' | 'success' | 'warning' | 'error';
    url?: string;
    is_banner?: boolean;
}

export interface BroadcastHistory {
    id: number;
    title: string;
    message: string;
    type: string;
    notification_type: string;
    url?: string;
    is_banner: boolean;
    recipient_count: number;
    created_at: string;
}

export interface BroadcastHistoryResponse {
    history: {
        data: BroadcastHistory[];
        total: number;
        current_page: number;
        last_page: number;
    }
}

export const sendBroadcastNotification = async (data: BroadcastNotificationData) => {
    return api.post('/notifications/broadcast', data);
};

export const getBroadcastHistory = async (page = 1) => {
    return api.get<BroadcastHistoryResponse>(`/notifications/broadcast-history?page=${page}`);
};

export const deleteBroadcast = async (id: number) => {
    return api.delete(`/notifications/broadcast/${id}`);
};
