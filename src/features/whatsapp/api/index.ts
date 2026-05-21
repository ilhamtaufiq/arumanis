import type { WhatsAppStatus, SendMessageRequest, SendBulkRequest, SendBulkResult } from '../types';
import api from '@/lib/api-client';

export async function getSessionStatus(): Promise<WhatsAppStatus> {
    return api.get<WhatsAppStatus>('/whatsapp/status');
}

export async function connectSession(): Promise<{ message: string }> {
    return api.post<{ message: string }>('/whatsapp/start');
}

export async function logoutSession(): Promise<{ message: string }> {
    return api.post<{ message: string }>('/whatsapp/stop');
}

export async function sendMessage(data: SendMessageRequest): Promise<{ message: string }> {
    return api.post<{ message: string }>('/whatsapp/send', data);
}

export async function sendBulkMessages(data: SendBulkRequest): Promise<{ results: SendBulkResult[] }> {
    return api.post<{ results: SendBulkResult[] }>('/whatsapp/send-bulk', data);
}
