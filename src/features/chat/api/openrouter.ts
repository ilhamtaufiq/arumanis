import type { OpenRouterMessage, OpenRouterRequest, OpenRouterResponse, ToolDefinition, ToolCall } from '../types';

// OpenRouter configuration
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';
export const MODEL = 'nex-agi/deepseek-v3.1-nex-n1:free';

// Model usage info type
export interface ModelUsageInfo {
    model: string;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    finishReason: string | null;
}

// OpenRouter API key from environment
const getHeaders = (): Record<string, string> => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY || ''}`,
    'HTTP-Referer': window.location.origin,
    'X-Title': 'Arumanis Chat',
});

// Extended request type with tools
interface OpenRouterRequestWithTools extends OpenRouterRequest {
    tools?: ToolDefinition[];
    tool_choice?: 'auto' | 'none' | { type: 'function'; function: { name: string } };
}

// Extended response for tool calls
interface OpenRouterToolResponse extends OpenRouterResponse {
    choices: Array<{
        index: number;
        message?: {
            role: string;
            content: string | null;
            tool_calls?: ToolCall[];
        };
        delta?: {
            role?: string;
            content?: string;
            tool_calls?: Array<{
                index: number;
                id?: string;
                type?: string;
                function?: {
                    name?: string;
                    arguments?: string;
                };
            }>;
        };
        finish_reason: string | null;
    }>;
}

// Non-streaming chat completion
export async function sendChatMessage(
    messages: OpenRouterMessage[]
): Promise<OpenRouterResponse> {
    const request: OpenRouterRequest = {
        model: MODEL,
        messages,
        stream: false,
    };

    const response = await fetch(API_URL, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(request),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
            (errorData as { error?: { message?: string } })?.error?.message ||
            `OpenRouter API error: ${response.status}`
        );
    }

    return response.json();
}

// Chat with tools (non-streaming for tool calls)
export async function sendChatWithTools(
    messages: OpenRouterMessage[],
    tools: ToolDefinition[]
): Promise<OpenRouterToolResponse> {
    const request: OpenRouterRequestWithTools = {
        model: MODEL,
        messages,
        tools,
        tool_choice: 'auto',
        stream: false,
    };

    const response = await fetch(API_URL, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(request),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
            (errorData as { error?: { message?: string } })?.error?.message ||
            `OpenRouter API error: ${response.status}`
        );
    }

    return response.json();
}

// Streaming result type
export type StreamResult =
    | { type: 'content'; content: string }
    | { type: 'usage'; usage: ModelUsageInfo };

// Streaming chat completion with usage info
export async function* streamChatMessage(
    messages: OpenRouterMessage[]
): AsyncGenerator<StreamResult, void, unknown> {
    const request: OpenRouterRequest = {
        model: MODEL,
        messages,
        stream: true,
    };

    const response = await fetch(API_URL, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(request),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
            (errorData as { error?: { message?: string } })?.error?.message ||
            `OpenRouter API error: ${response.status}`
        );
    }

    if (!response.body) {
        throw new Error('Response body is null');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let usageInfo: ModelUsageInfo | null = null;
    let finishReason: string | null = null;

    try {
        while (true) {
            const { done, value } = await reader.read();

            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');

            // Keep the last incomplete line in buffer
            buffer = lines.pop() || '';

            for (const line of lines) {
                const trimmedLine = line.trim();

                if (!trimmedLine || trimmedLine === 'data: [DONE]') {
                    continue;
                }

                if (trimmedLine.startsWith('data: ')) {
                    try {
                        const jsonStr = trimmedLine.slice(6);
                        const chunk = JSON.parse(jsonStr);
                        const content = chunk.choices?.[0]?.delta?.content;

                        // Capture finish reason
                        if (chunk.choices?.[0]?.finish_reason) {
                            finishReason = chunk.choices[0].finish_reason;
                        }

                        // Capture usage from chunk (OpenRouter sends it in stream)
                        if (chunk.usage) {
                            usageInfo = {
                                model: chunk.model || MODEL,
                                promptTokens: chunk.usage.prompt_tokens || 0,
                                completionTokens: chunk.usage.completion_tokens || 0,
                                totalTokens: chunk.usage.total_tokens || 0,
                                finishReason: finishReason,
                            };
                        }

                        if (content) {
                            yield { type: 'content', content };
                        }
                    } catch {
                        // Skip invalid JSON chunks
                        console.warn('Failed to parse chunk:', trimmedLine);
                    }
                }
            }
        }

        // Yield usage info at the end if available
        if (usageInfo) {
            yield { type: 'usage', usage: usageInfo };
        }
    } finally {
        reader.releaseLock();
    }
}
