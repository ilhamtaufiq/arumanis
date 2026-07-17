export interface WhatsAppStatus {
    status: 'disconnected' | 'connecting' | 'connected'
    qrCode: string | null
    connectedNumber: string | null
    lastError?: string | null
    message?: string
}

export interface SendMessageRequest {
    to: string
    message: string
}

export interface SendBulkRequest {
    recipients: Array<{
        phone: string
        message: string
    }>
}

export interface SendBulkResult {
    phone: string
    success: boolean
    error?: string
}

export interface WhatsAppChat {
    id: string
    name: string
    lastMessageText: string
    lastMessageTime: number
    unreadCount: number
    isGroup: boolean
}

export interface WhatsAppChatMessage {
    id: string
    jid: string
    fromMe: boolean
    timestamp: number
    text: string
    pushName: string | null
}

export interface WhatsAppChatsResponse {
    data: WhatsAppChat[]
}

export interface WhatsAppChatMessagesResponse {
    data: WhatsAppChatMessage[]
    meta: { jid: string; count: number }
}
