import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, User, Loader2, AlertCircle, Trash2, Sparkles, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';

import { Badge } from '@/components/ui/badge';
import { streamChatMessage, MODEL, type ModelUsageInfo } from '../api/openrouter';
import { executeTool } from '../api/tools';
import type { ChatMessage, OpenRouterMessage } from '../types';
import Markdown from 'react-markdown';

// Generate unique ID
function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function Chat() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [usageInfo, setUsageInfo] = useState<ModelUsageInfo | null>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (scrollAreaRef.current) {
            const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }
        }
    }, [messages]);

    // Focus textarea on mount
    useEffect(() => {
        textareaRef.current?.focus();
    }, []);

    const handleSend = useCallback(async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = {
            id: generateId(),
            role: 'user',
            content: input.trim(),
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setError(null);
        setIsLoading(true);

        // Create assistant message placeholder
        const assistantMessage: ChatMessage = {
            id: generateId(),
            role: 'assistant',
            content: '',
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);

        try {
            // Build system prompt that instructs AI to use JSON for tool calls
            // Made more explicit for smaller models
            const systemPrompt = `Kamu adalah asisten database. Tugasmu HANYA menghasilkan JSON untuk query database.

ATURAN KETAT:
1. Jika user bertanya tentang: SPK, kontrak, pekerjaan, statistik, kecamatan, total, berapa, cari, daftar, foto, dokumentasi, output, komponen
2. HANYA OUTPUT JSON, tidak ada teks lain!
3. Format: {"tool": "nama", "args": {...}}

TOOLS:
- search_kontrak: Untuk SPK/kontrak. {"tool": "search_kontrak", "args": {"search": "nama pekerjaan"}}
- search_pekerjaan: Untuk cari pekerjaan. {"tool": "search_pekerjaan", "args": {"search": "kata kunci"}}
- get_dashboard_stats: Untuk total/statistik. {"tool": "get_dashboard_stats", "args": {}}
- get_kecamatan_list: Untuk daftar kecamatan. {"tool": "get_kecamatan_list", "args": {}}
- get_pekerjaan_by_kecamatan: Untuk pekerjaan di kecamatan. {"tool": "get_pekerjaan_by_kecamatan", "args": {"kecamatan_name": "nama"}}
- search_foto: Untuk cari foto dokumentasi. {"tool": "search_foto", "args": {"search": "nama pekerjaan"}}
- get_foto_by_pekerjaan: Untuk foto di pekerjaan tertentu. {"tool": "get_foto_by_pekerjaan", "args": {"pekerjaan_id": 123}}
- search_output: Untuk cari output/komponen. {"tool": "search_output", "args": {"search": "nama komponen"}}
- get_output_by_pekerjaan: Untuk output di pekerjaan tertentu. {"tool": "get_output_by_pekerjaan", "args": {"pekerjaan_id": 123}}

CONTOH:
User: "Cari SPK untuk Pembangunan Tangki Septik Cisalak"
Output: {"tool": "search_kontrak", "args": {"search": "Pembangunan Tangki Septik Cisalak"}}

User: "Berapa total pekerjaan?"
Output: {"tool": "get_dashboard_stats", "args": {}}

User: "Cari foto pekerjaan rumah"
Output: {"tool": "search_foto", "args": {"search": "rumah"}}

User: "Cari output tangki septik"
Output: {"tool": "search_output", "args": {"search": "tangki septik"}}

SELALU output JSON saja untuk pertanyaan data!`;

            const apiMessages: OpenRouterMessage[] = [
                { role: 'system', content: systemPrompt },
                ...messages.map(m => ({
                    role: m.role as 'user' | 'assistant',
                    content: m.content,
                })),
                { role: 'user', content: userMessage.content },
            ];

            // First request to get AI response (may be tool call or direct answer)
            let fullContent = '';
            for await (const result of streamChatMessage(apiMessages)) {
                if (result.type === 'content') {
                    fullContent += result.content;
                    setMessages(prev =>
                        prev.map(m =>
                            m.id === assistantMessage.id
                                ? { ...m, content: fullContent }
                                : m
                        )
                    );
                } else if (result.type === 'usage') {
                    setUsageInfo(result.usage);
                }
            }

            // Check if response is a JSON tool call
            // Strip Mistral model artifacts like <s> tags and extract JSON
            let jsonContent = fullContent.trim();
            // Remove common model artifacts
            jsonContent = jsonContent.replace(/^<\/?s>/g, '').trim();
            jsonContent = jsonContent.replace(/<\/?s>$/g, '').trim();

            // Try to extract JSON from the response
            const jsonMatch = jsonContent.match(/\{[\s\S]*"tool"[\s\S]*\}/);
            if (jsonMatch) {
                try {
                    const toolCall = JSON.parse(jsonMatch[0]);
                    if (toolCall.tool) {
                        // Update message to show loading
                        setMessages(prev =>
                            prev.map(m =>
                                m.id === assistantMessage.id
                                    ? { ...m, content: '🔍 Mengambil data dari database...' }
                                    : m
                            )
                        );

                        // Execute the tool
                        const toolResult = await executeTool(toolCall.tool, toolCall.args || {});

                        // Send follow-up request with tool result
                        const followUpMessages: OpenRouterMessage[] = [
                            { role: 'system', content: 'Kamu adalah asisten AI. User telah bertanya dan kamu sudah mengambil data dari database. Berikan jawaban yang informatif berdasarkan data berikut. Format angka dengan pemisah ribuan. Jawab dalam Bahasa Indonesia.' },
                            { role: 'user', content: userMessage.content },
                            { role: 'assistant', content: `Saya mengambil data dari database. Hasilnya: ${toolResult}` },
                            { role: 'user', content: 'Berdasarkan data tersebut, berikan jawaban yang informatif dan rapi untuk pertanyaan saya.' },
                        ];

                        let finalContent = '';
                        for await (const result of streamChatMessage(followUpMessages)) {
                            if (result.type === 'content') {
                                finalContent += result.content;
                                setMessages(prev =>
                                    prev.map(m =>
                                        m.id === assistantMessage.id
                                            ? { ...m, content: finalContent }
                                            : m
                                    )
                                );
                            } else if (result.type === 'usage') {
                                setUsageInfo(result.usage);
                            }
                        }
                    }
                } catch {
                    // Not valid JSON, keep original response
                    console.log('Response was not a valid tool call JSON');
                }
            }
        } catch (err) {
            console.error('Chat error:', err);
            setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat mengirim pesan');
            // Remove the empty assistant message on error
            setMessages(prev => prev.filter(m => m.id !== assistantMessage.id));
        } finally {
            setIsLoading(false);
        }
    }, [input, isLoading, messages]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleClearChat = () => {
        setMessages([]);
        setError(null);
        setUsageInfo(null);
    };

    return (
        <>
            {/* ===== Top Heading ===== */}
            <Header>
                <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <h1 className="text-lg font-semibold">Chat</h1>
                    <Badge variant="outline" className="text-xs font-normal">
                        {MODEL.split('/').pop()?.replace(':free', '') || MODEL}
                    </Badge>
                </div>
                <div className="ms-auto flex items-center space-x-4">
                    {usageInfo && (
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <Info className="h-3 w-3" />
                                <span>In: {usageInfo.promptTokens.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span>Out: {usageInfo.completionTokens.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span>Total: {usageInfo.totalTokens.toLocaleString()}</span>
                            </div>
                        </div>
                    )}

                </div>
            </Header>

            {/* ===== Main ===== */}
            <Main className="flex flex-col h-[calc(100vh-4rem)] p-0">
                {/* Chat Messages */}
                <ScrollArea ref={scrollAreaRef} className="flex-1 px-4">
                    <div className="max-w-3xl mx-auto py-6 space-y-4">
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                                <div className="p-4 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 mb-4">
                                    <Bot className="h-12 w-12 text-primary" />
                                </div>
                                <h2 className="text-xl font-semibold mb-2">Selamat datang di arumanis Chat</h2>
                                {/* <p className="text-muted-foreground max-w-md">
                                    Powered by arumanis via OpenRouter. Mulai percakapan dengan mengetik pesan di bawah.
                                </p> */}
                            </div>
                        ) : (
                            messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''
                                        }`}
                                >
                                    {/* Avatar */}
                                    <div
                                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${message.role === 'user'
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-gradient-to-br from-violet-500 to-purple-600 text-white'
                                            }`}
                                    >
                                        {message.role === 'user' ? (
                                            <User className="h-4 w-4" />
                                        ) : (
                                            <Bot className="h-4 w-4" />
                                        )}
                                    </div>

                                    {/* Message Bubble */}
                                    <div
                                        className={`relative max-w-[80%] px-4 py-3 rounded-2xl ${message.role === 'user'
                                            ? 'bg-primary text-primary-foreground rounded-br-md'
                                            : 'bg-muted rounded-bl-md'
                                            }`}
                                    >
                                        <div className="prose prose-sm dark:prose-invert max-w-none break-words">
                                            {message.content ? (
                                                <Markdown>{message.content}</Markdown>
                                            ) : (
                                                <span className="flex items-center gap-2 text-muted-foreground">
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    Mengetik...
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}

                        {/* Loading indicator */}
                        {isLoading && messages[messages.length - 1]?.content && (
                            <div className="flex justify-center">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    AI sedang berpikir...
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                {/* Error Message */}
                {error && (
                    <div className="px-4">
                        <Card className="max-w-3xl mx-auto border-destructive bg-destructive/10">
                            <CardContent className="flex items-center gap-3 py-3">
                                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                                <p className="text-sm text-destructive">{error}</p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Input Area */}
                <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
                    <div className="max-w-3xl mx-auto">
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Textarea
                                    ref={textareaRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Ketik pesan Anda..."
                                    className="min-h-[52px] max-h-[200px] resize-none pr-12 rounded-xl"
                                    disabled={isLoading}
                                    rows={1}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Button
                                    onClick={handleSend}
                                    disabled={!input.trim() || isLoading}
                                    size="icon"
                                    className="h-[52px] w-[52px] rounded-xl"
                                >
                                    {isLoading ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <Send className="h-5 w-5" />
                                    )}
                                </Button>
                            </div>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-muted-foreground">
                                Tekan Enter untuk mengirim, Shift+Enter untuk baris baru
                            </p>
                            {messages.length > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleClearChat}
                                    className="text-muted-foreground hover:text-destructive"
                                >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Hapus Chat
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </Main>
        </>
    );
}
