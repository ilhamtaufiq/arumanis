import type { WhatsAppStatus, SendMessageRequest, SendBulkRequest, SendBulkResult } from '../types';

const WHATSAPP_API_URL = 'http://localhost:4000';

export async function getSessionStatus(): Promise<WhatsAppStatus> {
    const response = await fetch(`${WHATSAPP_API_URL}/status`);
    if (!response.ok) throw new Error('Failed to get session status');
    return response.json();
}

export async function connectSession(): Promise<{ message: string }> {
    const response = await fetch(`${WHATSAPP_API_URL}/start`, {
        method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to connect');
    return response.json();
}

export async function logoutSession(): Promise<{ message: string }> {
    // WAHA uses stop session as logout
    const response = await fetch(`${WHATSAPP_API_URL}/stop`, {
        method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to logout');
    return response.json();
}

export async function sendMessage(data: SendMessageRequest): Promise<{ message: string }> {
    const response = await fetch(`${WHATSAPP_API_URL}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            to: data.to,
            text: data.message
        }),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send message');
    }
    return response.json();
}

export async function sendBulkMessages(data: SendBulkRequest): Promise<{ results: SendBulkResult[] }> {
    const response = await fetch(`${WHATSAPP_API_URL}/api/message/send-bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to send bulk messages');
    return response.json();
}
