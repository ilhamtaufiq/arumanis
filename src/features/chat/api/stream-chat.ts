export type ChatStreamEvent =
    | { type: 'meta'; session_id: number }
    | { type: 'token'; content: string }
    | { type: 'status'; message: string }
    | { type: 'done'; success: boolean; reply: string; session_id: number; cached?: boolean; model?: string; usage?: { total_tokens?: number } }
    | { type: 'error'; message: string };

export interface StreamChatParams {
    message: string;
    session_id: number | null;
    history: Array<{ role: 'user' | 'assistant'; content: string }>;
    provider: string;
}

export type StreamChatResult = {
    completed: boolean;
    reply: string;
    sessionId: number | null;
};

export async function streamChat(
    params: StreamChatParams,
    onEvent: (event: ChatStreamEvent) => void,
    signal?: AbortSignal,
): Promise<StreamChatResult> {
    const response = await fetch('/bff/api/chat/stream', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'text/event-stream',
        },
        body: JSON.stringify(params),
        signal,
    });

    if (!response.ok) {
        let message = response.statusText || 'Streaming gagal';
        try {
            const payload = await response.json();
            message = (payload as { message?: string }).message || message;
        } catch {
            // Keep default message.
        }
        throw new Error(message);
    }

    const reader = response.body?.getReader();
    if (!reader) {
        throw new Error('Browser tidak mendukung streaming response.');
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let completed = false;
    let reply = '';
    let sessionId: number | null = params.session_id;

    while (true) {
        const { done, value } = await reader.read();
        if (done) {
            break;
        }

        buffer += decoder.decode(value, { stream: true });

        let boundary = buffer.indexOf('\n\n');
        while (boundary !== -1) {
            const packet = buffer.slice(0, boundary);
            buffer = buffer.slice(boundary + 2);

            for (const line of packet.split('\n')) {
                if (!line.startsWith('data:')) {
                    continue;
                }

                const raw = line.slice(5).trim();
                if (!raw) {
                    continue;
                }

                const event = JSON.parse(raw) as ChatStreamEvent;
                onEvent(event);

                if (event.type === 'meta' && event.session_id) {
                    sessionId = event.session_id;
                }

                if (event.type === 'token' && event.content) {
                    reply += event.content;
                }

                if (event.type === 'done') {
                    completed = true;
                    reply = event.reply || reply;
                    sessionId = event.session_id ?? sessionId;
                }

                if (event.type === 'error') {
                    throw new Error(event.message);
                }
            }

            boundary = buffer.indexOf('\n\n');
        }
    }

    return { completed, reply, sessionId };
}