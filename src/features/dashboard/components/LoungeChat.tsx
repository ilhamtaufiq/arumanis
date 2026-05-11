import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Bot, User, Send, RefreshCw } from 'lucide-react'
import { sendInternalChat } from '@/features/chat/api/internal-chat'
import Markdown from 'react-markdown'
import { cn } from '@/lib/utils'

import { ChatChart } from './ChatChart'

interface Message {
    role: 'user' | 'assistant'
    content: string
}

export function LoungeChat() {
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

    const greeting = `Hai! 👋 Saya Ami, asisten AI analisis data untuk aplikasi Arumanis (Sistem Informasi Pekerjaan Umum).

Saya siap membantu Anda untuk:

*   🔍 Mencari data proyek pekerjaan umum
*   📊 Menganalisis progres fisik dan keuangan
*   🏢 Melihat informasi penyedia/kontraktor
*   📍 Mendapatkan lokasi proyek
*   📸 Menampilkan foto lapangan (jika tersedia)

Silakan berikan pertanyaan terkait data proyek yang ingin Anda ketahui. Misalnya:

> "Proyek apa saja di wilayah Cianjur?"
> "Siapa penyedia proyek Pembangunan SPAM?"
> "Berapa progres proyek SR Air Minum?"

Ada yang bisa saya bantu?`;

    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: greeting }
    ])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [sessionId, setSessionId] = useState<number | null>(null)
    const [currentModel, setCurrentModel] = useState<string | null>(() => localStorage.getItem('ami_last_model'))
    const [isError, setIsError] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    // Scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]')
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight
            }
        }
    }, [messages, isLoading])

    const handleSend = async (customMessage?: string) => {
        const messageText = customMessage || input.trim()
        if (!messageText || isLoading) return

        if (!customMessage) setInput('')

        // Add user message to UI
        setMessages(prev => [...prev, { role: 'user', content: messageText }])

        setIsLoading(true)
        setIsError(false)

        try {
            const res = await sendInternalChat(messageText, sessionId)
            setSessionId(res.session_id)
            setMessages(prev => [...prev, { role: 'assistant', content: res.reply }])
            if (res.model) {
                setCurrentModel(res.model)
                localStorage.setItem('ami_last_model', res.model)
            }
            setIsError(false)
        } catch (error) {
            console.error('Chat error:', error)
            setIsError(true)
            setMessages(prev => [...prev, { role: 'assistant', content: 'Maaf bos, Ami lagi gangguan koneksi. 🙏' }])
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="border-none shadow-xl bg-gradient-to-br from-background/50 to-muted/30 backdrop-blur-xl overflow-hidden ring-1 ring-primary/10 transition-all duration-500">
            <CardHeader className="py-3 px-6 border-b border-primary/5 bg-primary/5 flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-primary/20 shadow-inner">
                            <Bot className="h-6 w-6 text-primary" />
                        </div>
                        <div className={cn(
                            "absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-background animate-pulse",
                            isError ? "bg-destructive" : "bg-emerald-500"
                        )} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                            Ami Assistant
                        </h3>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <span className={cn(
                                "w-1.5 h-1.5 rounded-full animate-pulse",
                                isError ? "bg-destructive" : "bg-emerald-500"
                            )} />
                            {isError ? 'Gangguan Layanan' : (currentModel ? currentModel.split('/').pop() : 'AI Analisis Data Terhubung')}
                        </p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full hover:bg-primary/10"
                    onClick={() => handleSend('Tampilkan ringkasan eksekutif hari ini')}
                    disabled={isLoading}
                    title="Minta Laporan"
                >
                    <RefreshCw className={cn("h-4 w-4 text-primary/70", isLoading && "animate-spin")} />
                </Button>
            </CardHeader>

            <CardContent className="p-0 flex flex-col">
                <ScrollArea className="h-[420px] px-6 py-4" ref={scrollRef}>
                    <div className="space-y-5 pr-4 pb-4">
                        {messages.map((m, i) => {
                            const chartData = m.role === 'assistant' ? extractChartData(m.content) : null
                            // Remove JSON block from display text for assistant messages
                            const displayText = chartData && m.role === 'assistant'
                                ? m.content.replace(/```json\n[\s\S]*?\n```/, '').replace(/{[\s\S]*?"type":\s*"chart"[\s\S]*?}/, '')
                                : m.content

                            return (
                                <div
                                    key={i}
                                    className={cn(
                                        "flex gap-3 text-sm animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both",
                                        m.role === 'user' ? "flex-row-reverse" : "flex-row"
                                    )}
                                    style={{ animationDelay: `${i * 100}ms` }}
                                >
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm transition-transform hover:scale-110",
                                        m.role === 'user' ? "bg-primary text-primary-foreground" : "bg-background border ring-1 ring-primary/5"
                                    )}>
                                        {m.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4 text-primary" />}
                                    </div>
                                    <div className="max-w-[85%] flex flex-col gap-2">
                                        <div className={cn(
                                            "rounded-2xl px-4 py-3 shadow-sm transition-all hover:shadow-md",
                                            m.role === 'user'
                                                ? "bg-primary text-primary-foreground rounded-tr-none"
                                                : "bg-background/80 border rounded-tl-none prose prose-sm prose-p:leading-relaxed dark:prose-invert max-w-none backdrop-blur-sm"
                                        )}>
                                            <Markdown>{displayText}</Markdown>
                                        </div>
                                        {chartData && (
                                            <div className="animate-in fade-in zoom-in-95 duration-700 delay-300">
                                                <ChatChart
                                                    data={chartData.data}
                                                    type={chartData.chart_type}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}

                        {isLoading && (
                            <div className="flex gap-3 text-sm animate-in fade-in duration-300">
                                <div className="w-8 h-8 rounded-full bg-background border flex items-center justify-center ring-1 ring-primary/5 shadow-sm">
                                    <Bot className="h-4 w-4 text-primary animate-bounce" />
                                </div>
                                <div className="bg-background/80 border rounded-2xl rounded-tl-none px-5 py-4 flex items-center gap-1.5 shadow-sm backdrop-blur-sm">
                                    <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                    <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                    <div className="w-2 h-2 bg-primary/80 rounded-full animate-bounce" />
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                <div className="p-4 border-t border-primary/5 bg-background/40 backdrop-blur-md">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault()
                            handleSend()
                        }}
                        className="flex gap-2 relative group"
                    >
                        <Input
                            placeholder="Ketik pertanyaan untuk Ami di sini..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={isLoading}
                            className="flex-1 h-12 bg-background/50 border-primary/10 focus-visible:ring-primary/20 pr-14 transition-all group-focus-within:border-primary/30 rounded-xl"
                        />
                        <Button
                            type="submit"
                            size="icon"
                            disabled={isLoading || !input.trim()}
                            className="absolute right-1 top-1 bottom-1 h-10 w-12 bg-transparent text-primary hover:bg-primary/5 border-none shadow-none transition-transform hover:scale-110 active:scale-95"
                        >
                            <Send className="h-5 w-5" />
                        </Button>
                    </form>
                    <p className="text-[10px] text-center text-muted-foreground mt-3 opacity-50 font-medium">
                        Ami Assistant • Data Real-time Arumanis
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}
