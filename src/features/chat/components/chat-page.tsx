import { useState, useRef, useEffect } from 'react'
import { Send, User, Bot, Sparkles, Loader2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import api from '@/lib/api-client'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

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

interface ChatResponse {
    success: boolean
    reply: string
    tool_calls?: ToolCall[]
    message?: string
}

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
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

    const handleSend = async () => {
        if (!input.trim() || isLoading) return

        const userMsg: Message = { role: 'user', content: input }
        setMessages((prev) => [...prev, userMsg])
        setInput('')
        setIsLoading(true)

        try {
            const response = await api.post<ChatResponse>('/chat', {
                message: input,
                history: messages.slice(-10),
            })
            
            if (response.success) {
                const assistantMsg: Message = {
                    role: 'assistant',
                    content: response.reply,
                    tool_calls: response.tool_calls
                }
                setMessages((prev) => [...prev, assistantMsg])
            } else {
                toast.error(response.message || 'Gagal mendapatkan respon AI')
            }
        } catch (error: any) {
            console.error('Chat Error:', error)
            toast.error(error.response?.data?.message || 'Terjadi kesalahan saat menghubungi server.')
        } finally {
            setIsLoading(false)
        }
    }

    const clearChat = () => {
        setMessages([])
    }

    return (
        <div className='flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto'>
            <div className='flex items-center justify-between mb-4'>
                <div className='flex items-center gap-2'>
                    <div className='p-2 bg-primary/10 rounded-lg'>
                        <Sparkles className='w-6 h-6 text-primary' />
                    </div>
                    <div>
                        <h1 className='text-2xl font-bold tracking-tight'>Ami AI Chat</h1>
                        <p className='text-sm text-muted-foreground'>Asisten cerdas untuk data Arumanis</p>
                    </div>
                </div>
                <Button variant='outline' size='sm' onClick={clearChat} disabled={messages.length === 0}>
                    <Trash2 className='w-4 h-4 mr-2' />
                    Bersihkan Chat
                </Button>
            </div>

            <Card className='flex-1 flex flex-col bg-background/50 backdrop-blur-sm border-muted/50 overflow-hidden'>
                <ScrollArea className='flex-1 p-4' viewportRef={scrollRef}>
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
                            {messages.map((msg, i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        'flex gap-3 max-w-[90%]',
                                        msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                                    )}
                                >
                                    <div
                                        className={cn(
                                            'w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm transition-transform hover:scale-110',
                                            msg.role === 'user' 
                                                ? 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground' 
                                                : 'bg-card border border-border text-muted-foreground'
                                        )}
                                    >
                                        {msg.role === 'user' ? (
                                            <User className='w-4 h-4' />
                                        ) : (
                                            <Bot className='w-4 h-4' />
                                        )}
                                    </div>
                                    <div className='flex flex-col gap-1'>
                                        <div
                                            className={cn(
                                                'px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-md',
                                                msg.role === 'user'
                                                    ? 'bg-primary text-primary-foreground rounded-tr-none'
                                                    : 'bg-card border border-border/50 backdrop-blur-md rounded-tl-none'
                                            )}
                                        >
                                            {msg.content}
                                        </div>
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
                            ))}
                            {isLoading && (
                                <div className='flex gap-3 max-w-[85%] mr-auto'>
                                    <div className='w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center animate-pulse'>
                                        <Bot className='w-4 h-4 text-muted-foreground' />
                                    </div>
                                    <div className='px-4 py-2.5 rounded-2xl rounded-tl-none bg-card border border-border shadow-sm'>
                                        <Loader2 className='w-4 h-4 animate-spin text-primary' />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </ScrollArea>

                <div className='p-4 border-t bg-background/50'>
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
    )
}
