import api from '@/lib/api-client';

export interface ToolCall {
    id: string;
    type: string;
    function: {
        name: string;
        arguments: string;
    };
}

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    tool_calls?: ToolCall[];
}

export interface ChatSessionSummary {
    id: number;
    title: string;
    messages_count: number;
    updated_at: string;
    updated_at_raw: string;
}

export interface ChatSessionMessagesResponse {
    success: boolean;
    data: {
        session: Record<string, unknown>;
        messages: ChatMessage[];
    };
}

export interface ChatResponse {
    success: boolean;
    reply: string;
    session_id: number;
    model?: string;
    cached?: boolean;
    tool_calls?: ToolCall[];
    message?: string;
    usage?: {
        total_tokens: number;
    };
}

export interface SendInternalChatParams {
    message: string;
    sessionId?: number | null;
    history?: ChatMessage[];
}

export async function sendInternalChat({
    message,
    sessionId,
    history,
}: SendInternalChatParams): Promise<ChatResponse> {
    return api.post<ChatResponse>('/chat', {
        message,
        session_id: sessionId,
        history,
    });
}

export interface ChatSessionsResponse {
    success: boolean;
    data: ChatSessionSummary[];
}

export async function getChatSessions(): Promise<ChatSessionsResponse> {
    return api.get<ChatSessionsResponse>('/chat/sessions');
}

export async function getSessionMessages(sessionId: number): Promise<ChatSessionMessagesResponse> {
    return api.get<ChatSessionMessagesResponse>(`/chat/sessions/${sessionId}/messages`);
}
