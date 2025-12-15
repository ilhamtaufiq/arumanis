// Chat message types
export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
}

// OpenRouter API types
export interface OpenRouterMessage {
    role: 'user' | 'assistant' | 'system' | 'tool';
    content: string;
    tool_call_id?: string;
    tool_calls?: ToolCall[];
}

export interface OpenRouterRequest {
    model: string;
    messages: OpenRouterMessage[];
    stream?: boolean;
    max_tokens?: number;
    temperature?: number;
}

export interface OpenRouterChoice {
    index: number;
    message?: {
        role: string;
        content: string | null;
        tool_calls?: ToolCall[];
    };
    delta?: {
        role?: string;
        content?: string;
    };
    finish_reason: string | null;
}

export interface OpenRouterResponse {
    id: string;
    model: string;
    choices: OpenRouterChoice[];
    usage?: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}

// Streaming chunk type
export interface StreamChunk {
    choices: Array<{
        delta: {
            content?: string;
        };
        finish_reason: string | null;
    }>;
}

// Tool/Function Calling Types
export interface ToolDefinition {
    type: 'function';
    function: {
        name: string;
        description: string;
        parameters: {
            type: 'object';
            properties: Record<string, {
                type: string;
                description: string;
                enum?: string[];
            }>;
            required?: string[];
        };
    };
}

export interface ToolCall {
    id: string;
    type: 'function';
    function: {
        name: string;
        arguments: string; // JSON string
    };
}

export interface ToolResult {
    tool_call_id: string;
    role: 'tool';
    content: string; // JSON string of result
}

export interface OpenRouterToolMessage extends OpenRouterMessage {
    tool_calls?: ToolCall[];
}

export interface OpenRouterToolResultMessage {
    role: 'tool';
    tool_call_id: string;
    content: string;
}
