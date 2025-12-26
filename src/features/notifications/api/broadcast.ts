import api from "@/lib/api-client";

export interface BroadcastNotificationData {
    title: string;
    message: string;
    type: 'all' | 'single' | 'multiple';
    user_ids?: number[];
    notification_type?: 'info' | 'success' | 'warning' | 'error';
    url?: string;
}

export const sendBroadcastNotification = async (data: BroadcastNotificationData) => {
    const response = await api.post('/notifications/broadcast', data) as any;
    return response.data;
};
