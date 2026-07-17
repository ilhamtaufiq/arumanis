import api from '@/lib/api-client'
import type {
    SendBulkRequest,
    SendBulkResult,
    SendMessageRequest,
    WhatsAppChatMessagesResponse,
    WhatsAppChatsResponse,
    WhatsAppStatus,
} from '../types'

export async function getSessionStatus(): Promise<WhatsAppStatus> {
    return api.get<WhatsAppStatus>('/whatsapp/status')
}

export async function connectSession(): Promise<{ message: string } & Partial<WhatsAppStatus>> {
    return api.post<{ message: string } & Partial<WhatsAppStatus>>('/whatsapp/start')
}

export async function logoutSession(): Promise<{ message: string } & Partial<WhatsAppStatus>> {
    return api.post<{ message: string } & Partial<WhatsAppStatus>>('/whatsapp/stop')
}

export async function sendMessage(data: SendMessageRequest): Promise<{ message: string }> {
    return api.post<{ message: string }>('/whatsapp/send', data)
}

export async function sendBulkMessages(
    data: SendBulkRequest,
): Promise<{ results: SendBulkResult[] }> {
    return api.post<{ results: SendBulkResult[] }>('/whatsapp/send-bulk', data)
}

export async function getWhatsAppChats(limit = 50): Promise<WhatsAppChatsResponse> {
    return api.get<WhatsAppChatsResponse>(`/whatsapp/chats?limit=${limit}`)
}

export async function getWhatsAppChatMessages(
    jid: string,
    limit = 50,
): Promise<WhatsAppChatMessagesResponse> {
    return api.get<WhatsAppChatMessagesResponse>(
        `/whatsapp/chats/${encodeURIComponent(jid)}/messages?limit=${limit}`,
    )
}
