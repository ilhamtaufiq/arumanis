import api from '@/lib/api-client';

export interface ChatResponse {
    success: boolean;
    reply: string;
    session_id: number;
    model?: string;
    usage?: {
        total_tokens: number;
    };
}

export async function sendInternalChat(message: string, sessionId?: number | null): Promise<ChatResponse> {
    return api.post<ChatResponse>('/chat', {
        message,
        session_id: sessionId
    });
}

export async function getChatSessions() {
    return api.get<any[]>('/chat/sessions');
}

export async function getSessionMessages(sessionId: number) {
    return api.get<any[]>(`/chat/sessions/${sessionId}/messages`);
}
