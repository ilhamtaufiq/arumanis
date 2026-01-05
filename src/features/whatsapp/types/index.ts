export interface WhatsAppStatus {
    status: 'disconnected' | 'connecting' | 'connected';
    qrCode: string | null;
    connectedNumber: string | null;
}

export interface SendMessageRequest {
    to: string;
    message: string;
}

export interface SendBulkRequest {
    recipients: Array<{
        phone: string;
        message: string;
    }>;
}

export interface SendBulkResult {
    phone: string;
    success: boolean;
    error?: string;
}
