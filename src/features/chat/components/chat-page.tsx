import { useState, useRef, useEffect, useCallback } from 'react'
import { ArrowUp, Square, Sparkles, Loader2, Trash2, Plus, MessageSquare, PanelLeftClose, PanelLeft, Zap, Copy, RotateCcw, ThumbsUp, ThumbsDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import api from '@/lib/api-client'
import { streamChat, type ChatStreamEvent } from '../api/stream-chat'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Link } from '@tanstack/react-router'
import { ChatChart } from '../../dashboard/components/ChatChart'

interface ToolCall {
    id: string
    type: string
    function: {
        name: string
        arguments: string
    }
}

interface MessageMeta {
    tokens?: number
    costIdr?: number | null
    model?: string
    cached?: boolean
    instant?: boolean
}

interface Message {
    id?: number
    role: 'user' | 'assistant'
    content: string
    tool_calls?: ToolCall[]
    tokens_used?: number
    cost_idr?: number | null
    meta?: MessageMeta
}

interface ChatSession {
    id: number
    title: string
    messages_count: number
    updated_at: string
    updated_at_raw: string
}

interface ChatResponse {
    success: boolean
    reply: string
    session_id: number
    model?: string
    cached?: boolean
    tool_calls?: ToolCall[]
    message?: string
    cost_idr?: number | null
    usage?: { total_tokens: number; prompt_tokens?: number; completion_tokens?: number }
}

function formatIdr(value: number): string {
    return 'Rp' + value.toLocaleString('id-ID', { maximumFractionDigits: 2 })
}

// ── LocalStorage helpers ────────────────────────────────────────
const STORAGE_KEY = 'ami_chat_sessions_cache'

function getCachedSessions(): ChatSession[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        return raw ? JSON.parse(raw) : []
    } catch { return [] }
}

function setCachedSessions(sessions: ChatSession[]) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
    } catch { /* quota exceeded, ignore */ }
}

export default function ChatPage() {
    // Extract ALL chart blocks from message (invalid JSON skipped, text kept)
    const extractCharts = (content: string) => {
        const charts: Array<{ data: unknown; chart_type: string }> = []
        const blockRegex = /```json\n([\s\S]*?)\n```/g
        let m: RegExpExecArray | null
        while ((m = blockRegex.exec(content)) !== null) {
            try {
                const data = JSON.parse(m[1]) as { type?: string; chart_type?: string; data?: unknown }
                if (data.type === 'chart' && Array.isArray(data.data)) {
                    charts.push({ data: data.data, chart_type: data.chart_type || 'bar' })
                }
            } catch { /* skip invalid block, keep text */ }
        }
        return charts
    }

    const stripChartBlocks = (content: string) =>
        content.replace(/```json\n[\s\S]*?\n```/g, '').trim()

    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [sessions, setSessions] = useState<ChatSession[]>(() => getCachedSessions())
    const [activeSessionId, setActiveSessionId] = useState<number | null>(null)
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [loadingSessions, setLoadingSessions] = useState(false)
    const [totalTokens, setTotalTokens] = useState(0)
    const [totalCostIdr, setTotalCostIdr] = useState(0)
    const [hasPricing, setHasPricing] = useState(false)
    const [wasCached, setWasCached] = useState(false)
    const [currentModel, setCurrentModel] = useState<string | null>(() => localStorage.getItem('ami_last_model'))
    const [isError, setIsError] = useState(false)
    const [statusMessage, setStatusMessage] = useState<string | null>(null)
    const scrollRef = useRef<HTMLDivElement>(null)
    const abortRef = useRef<AbortController | null>(null)
    const stickToBottomRef = useRef(true)

    // Smart auto-scroll: only follow when user already at bottom.
    // ponytail: naikkan threshold 120 bila user kerap kehilangan posisi baca.
    useEffect(() => {
        const el = scrollRef.current
        if (el && stickToBottomRef.current) {
            el.scrollTop = el.scrollHeight
        }
    }, [messages, statusMessage])

    const handleScroll = useCallback(() => {
        const el = scrollRef.current
        if (!el) return
        stickToBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120
    }, [])

    // Load sessions on mount
    useEffect(() => {
        fetchSessions()
    }, [])

    const fetchSessions = useCallback(async () => {
        setLoadingSessions(true)
        try {
            const res = await api.get<{ success: boolean; data: ChatSession[] }>('/chat/sessions')
            if (res.success) {
                setSessions(res.data)
                setCachedSessions(res.data)
            }
        } catch {
            // Use cached sessions as fallback
        } finally {
            setLoadingSessions(false)
        }
    }, [])

    const loadSession = useCallback(async (sessionId: number) => {
        try {
            const res = await api.get<{ success: boolean; data: { messages: Message[] } }>(`/chat/sessions/${sessionId}/messages`)
            if (res.success) {
                setMessages(res.data.messages.map((m) => (
                    m.role === 'assistant' && !m.meta && (typeof m.tokens_used === 'number' || m.cost_idr != null)
                        ? { ...m, meta: { tokens: m.tokens_used || 0, costIdr: m.cost_idr } }
                        : m
                )))
                setActiveSessionId(sessionId)
            }
        } catch {
            toast.error('Gagal memuat percakapan')
        }
    }, [])

    const createNewSession = useCallback(() => {
        setMessages([])
        setActiveSessionId(null)
        setTotalTokens(0)
        setTotalCostIdr(0)
        setHasPricing(false)
        setWasCached(false)
    }, [])

    const deleteSession = useCallback(async (sessionId: number, e: React.MouseEvent) => {
        e.stopPropagation()
        try {
            await api.delete(`/chat/sessions/${sessionId}`)
            setSessions(prev => prev.filter(s => s.id !== sessionId))
            if (activeSessionId === sessionId) {
                createNewSession()
            }
            toast.success('Percakapan dihapus')
        } catch {
            toast.error('Gagal menghapus')
        }
    }, [activeSessionId, createNewSession])

    const voteMessage = useCallback(async (messageId: number, vote: 'up' | 'down') => {
        try {
            await api.post(`/chat/messages/${messageId}/vote`, { vote })
            toast.success(vote === 'up' ? 'Dicatat sebagai jawaban bagus' : 'Dicatat — tak akan dilatih')
        } catch {
            toast.error('Gagal menyimpan vote')
        }
    }, [])

    const applyAssistantReply = useCallback((reply: string, result?: ChatResponse) => {
        setMessages((prev) => {
            const next = [...prev]
            const lastIndex = next.length - 1
            if (lastIndex >= 0 && next[lastIndex].role === 'assistant') {
                next[lastIndex] = {
                    ...next[lastIndex],
                    content: reply,
                    tool_calls: result?.tool_calls,
                    meta: {
                        tokens: result?.usage?.total_tokens || 0,
                        costIdr: typeof result?.cost_idr === 'number' ? result.cost_idr : null,
                        model: result?.model,
                        cached: result?.cached,
                    },
                }
            }
            return next
        })

        if (result?.session_id) {
            setActiveSessionId((current) => current ?? result.session_id)
        }
        if (result?.cached) {
            setWasCached(true)
        }
        if (result?.usage?.total_tokens) {
            setTotalTokens((prev) => prev + result.usage!.total_tokens)
        }
        if (typeof result?.cost_idr === 'number') {
            setTotalCostIdr((prev) => prev + result.cost_idr!)
            setHasPricing(true)
        }
        if (result?.model) {
            setCurrentModel(result.model)
            localStorage.setItem('ami_last_model', result.model)
        }
    }, [])

    const runBlockingChat = useCallback(async (
        outgoing: string,
        history: Message[],
    ): Promise<ChatResponse> => {
        const result = await api.post<ChatResponse>('/chat', {
            message: outgoing,
            session_id: activeSessionId,
            history,
            provider: 'local',
        })

        if (!result.success || !result.reply?.trim()) {
            throw new Error(result.message || 'Chat gagal memberikan jawaban.')
        }

        applyAssistantReply(result.reply, result)
        fetchSessions()
        return result
    }, [activeSessionId, applyAssistantReply, fetchSessions])

    const stopStreaming = useCallback(() => {
        abortRef.current?.abort()
    }, [])

    const handleSend = async (override?: string) => {
        const raw = override ?? input
        if (!raw.trim() || isLoading) return

        const outgoing = raw.trim()
        const historySnapshot = messages.slice(-10)
        const userMsg: Message = { role: 'user', content: outgoing }
        setMessages((prev) => [...prev, userMsg])
        setInput('')
        setIsLoading(true)
        setWasCached(false)
        setIsError(false)
        setStatusMessage('Menyiapkan jawaban...')
        stickToBottomRef.current = true

        const controller = new AbortController()
        abortRef.current = controller

        let streamedContent = ''
        let hasTokens = false
        setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

        const handleStreamEvent = (event: ChatStreamEvent) => {
            if (event.type === 'meta' && event.session_id) {
                setActiveSessionId((current) => current ?? event.session_id)
            }

            if (event.type === 'status') {
                setStatusMessage(event.message)
            }

            if (event.type === 'token') {
                if (!hasTokens) {
                    hasTokens = true
                    setStatusMessage(null)
                }
                streamedContent += event.content
                setMessages((prev) => {
                    const next = [...prev]
                    const lastIndex = next.length - 1
                    if (lastIndex >= 0 && next[lastIndex].role === 'assistant') {
                        next[lastIndex] = {
                            ...next[lastIndex],
                            content: streamedContent,
                        }
                    }
                    return next
                })
            }

            if (event.type === 'done') {
                setStatusMessage(null)
                if (event.session_id) {
                    setActiveSessionId((current) => current ?? event.session_id)
                }
                setWasCached(event.cached || false)
                if (event.instant) {
                    toast.success('Jawaban instan — langsung dari database', { duration: 2000 })
                }
                setTotalTokens(prev => prev + (event.usage?.total_tokens || 0))
                if (typeof event.cost_idr === 'number') {
                    setTotalCostIdr(prev => prev + (event.cost_idr ?? 0))
                    setHasPricing(true)
                }
                if (event.model) {
                    setCurrentModel(event.model)
                    localStorage.setItem('ami_last_model', event.model)
                }
                setMessages((prev) => {
                    const next = [...prev]
                    const lastIndex = next.length - 1
                    if (lastIndex >= 0 && next[lastIndex].role === 'assistant') {
                        next[lastIndex] = {
                            ...next[lastIndex],
                            content: event.reply || streamedContent,
                            id: event.message_id ?? next[lastIndex].id,
                            meta: {
                                tokens: event.usage?.total_tokens || 0,
                                costIdr: typeof event.cost_idr === 'number' ? event.cost_idr : null,
                                model: event.model,
                                cached: event.cached,
                                instant: event.instant,
                            },
                        }
                    }
                    return next
                })
                fetchSessions()
            }
        }

        try {
            const streamResult = await streamChat({
                message: outgoing,
                session_id: activeSessionId,
                history: historySnapshot,
                provider: 'local',
            }, handleStreamEvent, controller.signal)

            if (!streamResult.completed || !streamResult.reply.trim()) {
                await runBlockingChat(outgoing, historySnapshot)
            }
        } catch (error: unknown) {
            if (error instanceof DOMException && error.name === 'AbortError') {
                setMessages((prev) => {
                    const next = [...prev]
                    const lastIndex = next.length - 1
                    if (lastIndex >= 0 && next[lastIndex].role === 'assistant' && !next[lastIndex].content) {
                        next.pop()
                    }
                    return next
                })
                toast.info('Generasi jawaban dihentikan')
                return
            }
            try {
                await runBlockingChat(outgoing, historySnapshot)
            } catch (fallbackError: unknown) {
                console.error('Chat Error:', error, fallbackError)
                setIsError(true)
                setMessages((prev) => {
                    if (prev.length === 0) return prev
                    const next = [...prev]
                    const lastIndex = next.length - 1
                    if (lastIndex >= 0 && next[lastIndex].role === 'assistant' && !next[lastIndex].content) {
                        next.pop()
                    }
                    return next
                })
                const message = fallbackError instanceof Error
                    ? fallbackError.message
                    : (error instanceof Error ? error.message : 'Terjadi kesalahan saat menghubungi server.')
                toast.error(message)
            }
        } finally {
            setStatusMessage(null)
            setIsLoading(false)
            if (abortRef.current === controller) {
                abortRef.current = null
            }
        }
    }

    const activeTitle = activeSessionId
        ? sessions.find(s => s.id === activeSessionId)?.title || 'Percakapan'
        : 'Diskusi Baru'

    return (
        <div className='flex h-[calc(100dvh-4rem)] min-h-0 bg-background'>
            {/* ── Sidebar riwayat ── */}
            {sidebarOpen && (
                <div
                    className='fixed inset-0 z-10 bg-background/60 backdrop-blur-sm sm:hidden'
                    onClick={() => setSidebarOpen(false)}
                />
            )}
            <aside className={cn(
                'shrink-0 flex-col overflow-hidden border-r bg-muted/30 transition-all duration-300 z-20',
                'max-sm:fixed max-sm:inset-y-0 max-sm:left-0 max-sm:bg-background',
                sidebarOpen ? 'flex w-64' : 'hidden w-0 border-r-0',
            )}>
                <div className='flex items-center justify-between px-3 py-2.5 shrink-0'>
                    <span className='text-xs font-semibold text-muted-foreground'>Riwayat</span>
                    <Button variant='ghost' size='icon' className='h-7 w-7' onClick={() => setSidebarOpen(false)}>
                        <PanelLeftClose className='w-4 h-4' />
                    </Button>
                </div>
                <div className='px-3 pb-2 shrink-0'>
                    <Button
                        variant='outline'
                        size='sm'
                        className='w-full justify-start gap-2 text-xs rounded-lg'
                        onClick={createNewSession}
                    >
                        <Plus className='w-3.5 h-3.5' />
                        Chat baru
                    </Button>
                </div>
                <div className='flex-1 overflow-y-auto px-2 pb-2 space-y-0.5'>
                    {loadingSessions && sessions.length === 0 ? (
                        <div className='flex items-center justify-center py-8'>
                            <Loader2 className='w-4 h-4 animate-spin text-muted-foreground' />
                        </div>
                    ) : sessions.length === 0 ? (
                        <p className='text-xs text-muted-foreground text-center py-8'>
                            Belum ada riwayat
                        </p>
                    ) : (
                        sessions.map(session => (
                            <div
                                key={session.id}
                                onClick={() => { loadSession(session.id); if (window.innerWidth < 640) setSidebarOpen(false) }}
                                className={cn(
                                    'group flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer text-[13px]',
                                    activeSessionId === session.id
                                        ? 'bg-muted font-medium'
                                        : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                                )}
                            >
                                <MessageSquare className='w-3.5 h-3.5 shrink-0 opacity-60' />
                                <p className='truncate flex-1'>{session.title}</p>
                                <Button
                                    variant='ghost'
                                    size='icon'
                                    className='h-5 w-5 opacity-0 group-hover:opacity-100 shrink-0'
                                    onClick={(e) => deleteSession(session.id, e)}
                                >
                                    <Trash2 className='w-3 h-3 text-destructive' />
                                </Button>
                            </div>
                        ))
                    )}
                </div>
            </aside>

            {/* ── Area chat ── */}
            <div className='flex flex-col flex-1 min-h-0 min-w-0'>
                {/* Bar atas ramping */}
                <div className='flex items-center gap-2 px-3 sm:px-4 h-12 shrink-0 border-b'>
                    <Button variant='ghost' size='icon' className='h-8 w-8' onClick={() => setSidebarOpen(v => !v)}>
                        <PanelLeft className='w-4 h-4' />
                    </Button>
                    <h2 className='text-sm font-semibold truncate flex-1'>{activeTitle}</h2>
                    {currentModel && (
                        <span className='hidden md:inline text-[11px] text-muted-foreground'>
                            {currentModel.split('/').pop()}
                        </span>
                    )}
                    {totalTokens > 0 && (
                        <span
                            className='flex items-center gap-1 text-[11px] text-muted-foreground'
                            title={hasPricing ? 'Estimasi biaya sesi ini' : 'Tarif belum diset di pengaturan AI'}
                        >
                            <Zap className='w-3 h-3' />
                            {totalTokens.toLocaleString()}
                            {hasPricing && <span className='font-semibold text-foreground'>· {formatIdr(totalCostIdr)}</span>}
                        </span>
                    )}
                </div>

                {/* Pesan */}
                <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className='flex-1 min-h-0 overflow-y-auto'
                >
                    <div className='mx-auto w-full max-w-3xl px-4 sm:px-6 py-6'>
                        {messages.length === 0 ? (
                            <div className='flex flex-col items-center text-center pt-16 sm:pt-24 space-y-6'>
                                <div className='w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center'>
                                    <Sparkles className='w-7 h-7 text-primary' />
                                </div>
                                <div className='space-y-2'>
                                    <p className='text-xl sm:text-2xl font-semibold tracking-tight'>Ada yang bisa Ami bantu?</p>
                                    <p className='text-sm text-muted-foreground max-w-sm'>
                                        Tanyakan paket pekerjaan, kontrak, progres, atau data Arumanis lainnya.
                                    </p>
                                </div>
                                <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg'>
                                    {[
                                        'Berapa total pekerjaan tahun ini?',
                                        'Cari paket SPAM terbaru',
                                        'Tiket apa yang masih terbuka?',
                                        'Ringkasan progres pekerjaan',
                                    ].map((suggestion) => (
                                        <button
                                            key={suggestion}
                                            disabled={isLoading}
                                            onClick={() => handleSend(suggestion)}
                                            className='text-left text-[13px] px-3.5 py-2.5 rounded-xl border bg-muted/40 hover:bg-muted transition-colors disabled:opacity-50'
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className='space-y-6'>
                                {messages.map((msg, i) => {
                                    const charts = msg.role === 'assistant' ? extractCharts(msg.content) : []
                                    const displayText = charts.length > 0 && msg.role === 'assistant'
                                        ? stripChartBlocks(msg.content)
                                        : msg.content

                                    if (msg.role === 'user') {
                                        return (
                                            <div key={i} className='flex justify-end'>
                                                <div className='max-w-[85%] sm:max-w-[75%] px-4 py-2.5 rounded-2xl bg-muted text-[14px] leading-relaxed whitespace-pre-wrap break-words'>
                                                    {msg.content}
                                                </div>
                                            </div>
                                        )
                                    }

                                    return (
                                        <div key={i} className='group'>
                                            <div className='text-[14px] leading-7 prose prose-sm dark:prose-invert max-w-none prose-p:my-2 break-words'>
                                                <ReactMarkdown
                                                    remarkPlugins={[remarkGfm]}
                                                    components={{
                                                        table: ({ ...props }) => (
                                                            <div className="overflow-x-auto my-3 rounded-lg border border-border/40">
                                                                <table className="w-full text-[13px] text-left border-collapse" {...props} />
                                                            </div>
                                                        ),
                                                        thead: ({ ...props }) => <thead className="bg-muted/40 font-semibold" {...props} />,
                                                        th: ({ ...props }) => <th className="px-3 py-2 border-b border-border/40" {...props} />,
                                                        td: ({ ...props }) => <td className="px-3 py-1.5 border-b border-border/20 last:border-0" {...props} />,
                                                        a: ({ href, children, ...props }) => {
                                                            const to = typeof href === 'string' ? href : ''
                                                            // ponytail: hanya /pekerjaan/:id internal; tambah rute lain bila prompt memakainya.
                                                            if (/^\/pekerjaan\/\d+/.test(to)) {
                                                                return <Link to={to} className="text-primary hover:underline font-medium" {...props}>{children}</Link>
                                                            }
                                                            return <a href={to} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer" {...props}>{children}</a>
                                                        },
                                                        img: ({ ...props }) => (
                                                            // eslint-disable-next-line jsx-a11y/alt-text
                                                            <img loading="lazy" className="rounded-xl border max-h-64 w-auto my-2" {...props} />
                                                        ),
                                                        ul: ({ ...props }) => <ul className="list-disc ml-5 space-y-1 my-2" {...props} />,
                                                        ol: ({ ...props }) => <ol className="list-decimal ml-5 space-y-1 my-2" {...props} />,
                                                        p: ({ ...props }) => <p className="my-2" {...props} />,
                                                        code: ({ ...props }) => <code className="bg-muted px-1.5 py-0.5 rounded text-[13px]" {...props} />,
                                                    }}
                                                >
                                                    {displayText}
                                                </ReactMarkdown>
                                            </div>

                                            {charts.map((chart, idx) => (
                                                <div key={idx} className="w-full mt-3">
                                                    <ChatChart
                                                        data={chart.data}
                                                        type={chart.chart_type}
                                                    />
                                                </div>
                                            ))}

                                            {msg.tool_calls && msg.tool_calls.length > 0 && (
                                                <div className='flex flex-wrap gap-1.5 mt-2'>
                                                    {msg.tool_calls.map((call, idx) => (
                                                        <span
                                                            key={idx}
                                                            className='inline-flex items-center gap-1 px-2 py-0.5 bg-muted rounded-full text-[11px] text-muted-foreground'
                                                        >
                                                            <Sparkles className='w-3 h-3' />
                                                            {call.function.name.replaceAll('_', ' ')}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                            {msg.meta && (msg.meta.tokens || msg.meta.costIdr != null || msg.meta.instant || msg.meta.cached) && (
                                                <p className='text-[11px] text-muted-foreground mt-1'>
                                                    {msg.meta.instant
                                                        ? '⚡ instan · 0 token'
                                                        : `${(msg.meta.tokens || 0).toLocaleString()} token`}
                                                    {msg.meta.costIdr != null && ` · ${formatIdr(msg.meta.costIdr)}`}
                                                    {msg.meta.cached && !msg.meta.instant && ' · cached'}
                                                    {msg.meta.model && ` · ${msg.meta.model.split('/').pop()}`}
                                                </p>
                                            )}
                                            {msg.content && !isLoading && (
                                                <div className='flex gap-0.5 mt-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity'>
                                                    <Button
                                                        variant='ghost'
                                                        size='icon'
                                                        className='h-7 w-7 text-muted-foreground'
                                                        title='Salin jawaban'
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(stripChartBlocks(msg.content)).then(
                                                                () => toast.success('Disalin'),
                                                                () => toast.error('Gagal menyalin'),
                                                            )
                                                        }}
                                                    >
                                                        <Copy className='w-3.5 h-3.5' />
                                                    </Button>
                                                    {i >= 2 && messages[i - 2]?.role === 'user' && (
                                                        <Button
                                                            variant='ghost'
                                                            size='icon'
                                                            className='h-7 w-7 text-muted-foreground'
                                                            title='Coba lagi'
                                                            onClick={() => setInput(messages[i - 2].content)}
                                                        >
                                                            <RotateCcw className='w-3.5 h-3.5' />
                                                        </Button>
                                                    )}
                                                    {msg.id && (
                                                        <>
                                                            <Button
                                                                variant='ghost'
                                                                size='icon'
                                                                className='h-7 w-7 text-muted-foreground'
                                                                title='Jawaban bagus — latih AI'
                                                                onClick={() => voteMessage(msg.id!, 'up')}
                                                            >
                                                                <ThumbsUp className='w-3.5 h-3.5' />
                                                            </Button>
                                                            <Button
                                                                variant='ghost'
                                                                size='icon'
                                                                className='h-7 w-7 text-muted-foreground'
                                                                title='Jawaban salah — jangan latih'
                                                                onClick={() => voteMessage(msg.id!, 'down')}
                                                            >
                                                                <ThumbsDown className='w-3.5 h-3.5' />
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                                {isLoading && statusMessage && (
                                    <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                                        <Loader2 className='w-4 h-4 animate-spin shrink-0' />
                                        <span className='italic'>{statusMessage}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Composer */}
                <div className='shrink-0 pb-3 sm:pb-5 pt-1'>
                    <div className='mx-auto w-full max-w-3xl px-4 sm:px-6'>
                        <form
                            data-chat-form
                            onSubmit={(e) => {
                                e.preventDefault()
                                handleSend()
                            }}
                            className='flex items-end gap-2 rounded-2xl border bg-background p-2 pl-4 shadow-sm focus-within:shadow-md transition-shadow'
                        >
                            <textarea
                                placeholder='Tanyakan sesuatu...'
                                value={input}
                                rows={1}
                                onChange={(e) => {
                                    setInput(e.target.value)
                                    e.target.style.height = 'auto'
                                    e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px'
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault()
                                        handleSend()
                                    }
                                }}
                                disabled={isLoading}
                                className='flex-1 max-h-40 bg-transparent text-[14px] leading-relaxed resize-none outline-none placeholder:text-muted-foreground disabled:opacity-50 py-2'
                            />
                            {isLoading ? (
                                <Button type='button' size='icon' onClick={stopStreaming} title='Hentikan' className='rounded-full shrink-0'>
                                    <Square className='w-4 h-4' />
                                </Button>
                            ) : (
                                <Button type='submit' size='icon' disabled={!input.trim()} title='Kirim' className='rounded-full shrink-0'>
                                    <ArrowUp className='w-4 h-4' />
                                </Button>
                            )}
                        </form>
                        <p className='text-[11px] text-center text-muted-foreground mt-2'>
                            Ami dapat keliru. Verifikasi data penting via menu master data.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
