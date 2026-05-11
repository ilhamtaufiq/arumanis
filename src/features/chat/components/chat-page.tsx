import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, User, Bot, Sparkles, Loader2, Trash2, Plus, MessageSquare, PanelLeftClose, PanelLeft, Clock, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import api from '@/lib/api-client'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ChatChart } from '../../dashboard/components/ChatChart'

interface ToolCall {
    id: string
    type: string
    function: {
        name: string
        arguments: string
    }
}

interface Message {
    role: 'user' | 'assistant'
    content: string
    tool_calls?: ToolCall[]
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
    usage?: { total_tokens: number }
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
    // Helper to extract chart data from message
    const extractChartData = (content: string) => {
        try {
            // Look for JSON block with "type": "chart"
            const jsonRegex = /```json\n([\s\S]*?)\n```/
            const match = content.match(jsonRegex)
            
            if (match && match[1]) {
                const data = JSON.parse(match[1])
                if (data.type === 'chart') return data
            }

            // Fallback for raw JSON without markdown blocks
            if (content.includes('"type": "chart"')) {
                const start = content.indexOf('{')
                const end = content.lastIndexOf('}') + 1
                const data = JSON.parse(content.substring(start, end))
                return data
            }
        } catch (e) {
            return null
        }
        return null
    }

    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [sessions, setSessions] = useState<ChatSession[]>(() => getCachedSessions())
    const [activeSessionId, setActiveSessionId] = useState<number | null>(null)
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [loadingSessions, setLoadingSessions] = useState(false)
    const [totalTokens, setTotalTokens] = useState(0)
    const [wasCached, setWasCached] = useState(false)
    const [currentModel, setCurrentModel] = useState<string | null>(() => localStorage.getItem('ami_last_model'))
    const [isError, setIsError] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: 'smooth',
            })
        }
    }, [messages])

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
                setMessages(res.data.messages)
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

    const handleSend = async () => {
        if (!input.trim() || isLoading) return

        const userMsg: Message = { role: 'user', content: input }
        setMessages((prev) => [...prev, userMsg])
        setInput('')
        setIsLoading(true)
        setWasCached(false)
        setIsError(false)

        try {
            const response = await api.post<ChatResponse>('/chat', {
                message: input,
                session_id: activeSessionId,
                history: messages.slice(-10),
            })
            
            if (response.success) {
                const assistantMsg: Message = {
                    role: 'assistant',
                    content: response.reply,
                    tool_calls: response.tool_calls
                }
                setMessages((prev) => [...prev, assistantMsg])
                
                // Update session info
                if (response.session_id && !activeSessionId) {
                    setActiveSessionId(response.session_id)
                }
                setWasCached(response.cached || false)
                setTotalTokens(prev => prev + (response.usage?.total_tokens || 0))
                if (response.model) {
                    setCurrentModel(response.model)
                    localStorage.setItem('ami_last_model', response.model)
                }
                setIsError(false)

                // Refresh sessions list
                fetchSessions()
            } else {
                toast.error(response.message || 'Gagal mendapatkan respon AI')
            }
        } catch (error: any) {
            console.error('Chat Error:', error)
            setIsError(true)
            toast.error(error.response?.data?.message || 'Terjadi kesalahan saat menghubungi server.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            <Header fixed>
                <div className='flex items-center justify-between w-full'>
                    <div className='flex items-center gap-2'>
                        <div className='p-2 bg-primary/10 rounded-lg'>
                            <Sparkles className='w-5 h-5 text-primary' />
                        </div>
                        <div>
                            <h1 className='text-xl font-bold tracking-tight'>Ami AI Assistant</h1>
                            <p className='text-xs text-muted-foreground'>Asisten cerdas data Arumanis</p>
                        </div>
                    </div>
                    <div className='flex items-center gap-3'>
                        {currentModel && (
                            <div className='hidden sm:flex items-center gap-1.5 text-[10px] text-muted-foreground bg-primary/5 border border-primary/10 px-2.5 py-1 rounded-full'>
                                <Bot className='w-3 h-3 text-primary' />
                                <span className='font-medium'>{currentModel.split('/').pop()}</span>
                            </div>
                        )}
                        {totalTokens > 0 && (
                            <div className='flex items-center gap-1.5 text-[10px] text-muted-foreground bg-muted/50 px-2 py-1 rounded-md'>
                                <Zap className='w-3 h-3' />
                                {totalTokens.toLocaleString()} tokens
                                {wasCached && <span className='text-green-500 font-bold ml-1'>● cached</span>}
                            </div>
                        )}
                    </div>
                </div>
            </Header>

            <Main fixed className='p-0 sm:p-4'>
                <div className='flex flex-1 min-h-0 lg:max-w-6xl mx-auto w-full gap-0 sm:gap-3'>
                    
                    {/* ── History Sidebar ──────────────────────────── */}
                    <div className={cn(
                        'flex flex-col shrink-0 transition-all duration-300 ease-in-out overflow-hidden',
                        sidebarOpen 
                            ? 'w-64 sm:w-72 border-r sm:border-r-0'
                            : 'w-0'
                    )}>
                        <div className='flex flex-col h-full min-w-[16rem] sm:min-w-[18rem]'>
                            {/* Sidebar header */}
                            <div className='flex items-center justify-between p-3 shrink-0'>
                                <h3 className='text-sm font-semibold text-muted-foreground'>Riwayat Chat</h3>
                                <Button variant='ghost' size='icon' className='h-7 w-7' onClick={() => setSidebarOpen(false)}>
                                    <PanelLeftClose className='w-4 h-4' />
                                </Button>
                            </div>
                            
                            {/* New chat button */}
                            <div className='px-3 pb-2 shrink-0'>
                                <Button 
                                    variant='outline' 
                                    size='sm' 
                                    className='w-full justify-start gap-2 text-xs'
                                    onClick={createNewSession}
                                >
                                    <Plus className='w-3.5 h-3.5' />
                                    Diskusi Baru
                                </Button>
                            </div>

                            {/* Sessions list */}
                            <div className='flex-1 overflow-y-auto px-2 space-y-0.5'>
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
                                            onClick={() => loadSession(session.id)}
                                            className={cn(
                                                'group flex items-start gap-2 px-2.5 py-2 rounded-lg cursor-pointer transition-colors text-xs',
                                                activeSessionId === session.id
                                                    ? 'bg-primary/10 text-primary'
                                                    : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                                            )}
                                        >
                                            <MessageSquare className='w-3.5 h-3.5 mt-0.5 shrink-0' />
                                            <div className='flex-1 min-w-0'>
                                                <p className='truncate font-medium'>{session.title}</p>
                                                <p className='text-[10px] opacity-60 flex items-center gap-1 mt-0.5'>
                                                    <Clock className='w-2.5 h-2.5' />
                                                    {session.updated_at}
                                                </p>
                                            </div>
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
                        </div>
                    </div>

                    {/* ── Main Chat Area ───────────────────────────── */}
                    <div className='flex flex-col flex-1 min-h-0 min-w-0'>
                        {/* Top bar */}
                        <div className='flex items-center justify-between mb-2 sm:mb-3 px-3 sm:px-0 shrink-0'>
                            <div className='flex items-center gap-2'>
                                {!sidebarOpen && (
                                    <Button variant='ghost' size='icon' className='h-7 w-7' onClick={() => setSidebarOpen(true)}>
                                        <PanelLeft className='w-4 h-4' />
                                    </Button>
                                )}
                                <h2 className='text-sm sm:text-base font-semibold'>
                                    {activeSessionId
                                        ? sessions.find(s => s.id === activeSessionId)?.title || 'Percakapan'
                                        : 'Diskusi Baru'
                                    }
                                </h2>
                            </div>
                            <Button variant='ghost' size='sm' onClick={createNewSession} disabled={messages.length === 0} className='text-muted-foreground text-xs'>
                                <Plus className='w-3.5 h-3.5 mr-1.5' />
                                Baru
                            </Button>
                        </div>

                        <Card className='flex flex-col flex-1 min-h-0 bg-background/40 backdrop-blur-md border-x-0 sm:border-x border-y sm:border-border/50 shadow-xl rounded-none sm:rounded-xl'>
                            {/* Scrollable message area */}
                            <div
                                ref={scrollRef}
                                className='flex-1 min-h-0 overflow-y-auto sm:p-4 p-3'
                            >
                                {messages.length === 0 ? (
                                    <div className='h-full flex flex-col items-center justify-center text-center space-y-4 py-20 grayscale opacity-50'>
                                        <Bot className='w-16 h-16' />
                                        <div className='space-y-2'>
                                            <p className='text-lg font-medium'>Belum ada percakapan</p>
                                            <p className='text-sm max-w-xs'>
                                                Tanyakan apa saja seputar paket pekerjaan, kontrak, atau penyedia di Arumanis.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className='space-y-6'>
                                        {messages.map((msg, i) => {
                                            const chartData = msg.role === 'assistant' ? extractChartData(msg.content) : null
                                            const displayText = chartData && msg.role === 'assistant' 
                                                ? msg.content.replace(/```json\n[\s\S]*?\n```/, '').replace(/{[\s\S]*?"type":\s*"chart"[\s\S]*?}/, '') 
                                                : msg.content

                                            return (
                                                <div
                                                    key={i}
                                                    className={cn(
                                                        'flex gap-2 sm:gap-3 max-w-[95%] sm:max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both',
                                                        msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                                                    )}
                                                    style={{ animationDelay: `${(i % 10) * 50}ms` }}
                                                >
                                                    <div
                                                        className={cn(
                                                            'w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm transition-transform hover:scale-110 relative',
                                                            msg.role === 'user' 
                                                                ? 'bg-primary text-primary-foreground' 
                                                                : 'bg-card border border-border text-muted-foreground'
                                                        )}
                                                    >
                                                        {msg.role === 'user' ? (
                                                            <User className='w-4 h-4' />
                                                        ) : (
                                                            <>
                                                                <Bot className='w-4 h-4 text-primary' />
                                                                <div className={cn(
                                                                    "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-background animate-pulse",
                                                                    isError ? "bg-destructive" : "bg-emerald-500"
                                                                )} />
                                                            </>
                                                        )}
                                                    </div>
                                                    <div className='flex flex-col gap-2 flex-1 min-w-0'>
                                                        <div
                                                            className={cn(
                                                                'px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm transition-all hover:shadow-md',
                                                                msg.role === 'user'
                                                                    ? 'bg-primary text-primary-foreground rounded-tr-none'
                                                                    : 'bg-background/80 border border-border/50 backdrop-blur-md rounded-tl-none prose prose-sm prose-p:leading-relaxed dark:prose-invert max-w-none'
                                                            )}
                                                        >
                                                            <ReactMarkdown 
                                                                remarkPlugins={[remarkGfm]}
                                                                components={{
                                                                    table: ({ ...props }) => (
                                                                        <div className="overflow-x-auto my-3 rounded-lg border border-border/40">
                                                                            <table className="w-full text-[11px] text-left border-collapse" {...props} />
                                                                        </div>
                                                                    ),
                                                                    thead: ({ ...props }) => <thead className="bg-muted/30 text-muted-foreground font-bold" {...props} />,
                                                                    th: ({ ...props }) => <th className="px-3 py-2 border-b border-border/40" {...props} />,
                                                                    td: ({ ...props }) => <td className="px-3 py-1.5 border-b border-border/20 last:border-0" {...props} />,
                                                                    a: ({ ...props }) => <a className="text-primary hover:underline font-bold" target="_blank" rel="noopener noreferrer" {...props} />,
                                                                    ul: ({ ...props }) => <ul className="list-disc ml-4 space-y-1 my-2" {...props} />,
                                                                    ol: ({ ...props }) => <ol className="list-decimal ml-4 space-y-1 my-2" {...props} />,
                                                                    p: ({ ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                                                                }}
                                                            >
                                                                {displayText}
                                                            </ReactMarkdown>
                                                        </div>
                                                        
                                                        {chartData && (
                                                            <div className="animate-in fade-in zoom-in-95 duration-700 delay-300 w-full">
                                                                <ChatChart 
                                                                    data={chartData.data} 
                                                                    type={chartData.chart_type} 
                                                                />
                                                            </div>
                                                        )}

                                                        {msg.tool_calls && msg.tool_calls.length > 0 && (
                                                            <div className='flex flex-wrap gap-2 mt-1'>
                                                                {msg.tool_calls.map((call, idx) => (
                                                                    <div 
                                                                        key={idx}
                                                                        className='flex items-center gap-1.5 px-2 py-1 bg-primary/5 border border-primary/20 rounded-lg text-[10px] font-medium text-primary animate-in fade-in slide-in-from-left-1'
                                                                    >
                                                                        <Sparkles className='w-3 h-3' />
                                                                        Skill: {call.function.name.replace('_', ' ')}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                        {isLoading && (
                                            <div className='flex gap-3 max-w-[85%] mr-auto animate-in fade-in duration-300'>
                                                <div className='w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center relative shadow-sm'>
                                                    <Bot className='w-4 h-4 text-primary animate-bounce' />
                                                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-background animate-pulse" />
                                                </div>
                                                <div className='bg-background/80 border border-border/50 rounded-2xl rounded-tl-none px-5 py-3 flex items-center gap-1.5 shadow-sm backdrop-blur-sm'>
                                                    <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                                    <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                                    <div className="w-1.5 h-1.5 bg-primary/80 rounded-full animate-bounce" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Fixed input area */}
                            <div className='shrink-0 p-2 sm:p-4 border-t bg-background/50'>
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault()
                                        handleSend()
                                    }}
                                    className='flex gap-2'
                                >
                                    <Input
                                        placeholder='Tanyakan sesuatu...'
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        disabled={isLoading}
                                        className='flex-1 bg-card'
                                    />
                                    <Button type='submit' size='icon' disabled={isLoading || !input.trim()}>
                                        {isLoading ? <Loader2 className='w-4 h-4 animate-spin' /> : <Send className='w-4 h-4' />}
                                    </Button>
                                </form>
                                <p className='text-[10px] text-center text-muted-foreground mt-2'>
                                    AI dapat memberikan informasi yang kurang akurat. Verifikasi data penting melalui menu master data.
                                </p>
                            </div>
                        </Card>
                    </div>
                </div>
            </Main>
        </>
    )
}
