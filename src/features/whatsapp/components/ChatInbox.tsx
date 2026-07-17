import { useCallback, useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { Inbox, MessageCircle, RefreshCw, Users } from 'lucide-react'
import { getWhatsAppChatMessages, getWhatsAppChats } from '../api'
import type { WhatsAppChat, WhatsAppChatMessage } from '../types'
import { toast } from 'sonner'

function formatChatTime(timestamp: number) {
    if (!timestamp) return ''
    return new Date(timestamp).toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    })
}

function formatMessageTime(timestamp: number) {
    return new Date(timestamp).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
    })
}

export default function ChatInbox() {
    const [chats, setChats] = useState<WhatsAppChat[]>([])
    const [messages, setMessages] = useState<WhatsAppChatMessage[]>([])
    const [selectedChat, setSelectedChat] = useState<WhatsAppChat | null>(null)
    const [loadingChats, setLoadingChats] = useState(true)
    const [loadingMessages, setLoadingMessages] = useState(false)

    const fetchChats = useCallback(async () => {
        try {
            const response = await getWhatsAppChats(80)
            setChats(response.data)
        } catch (error) {
            console.error('Failed to load WhatsApp chats:', error)
            setChats([])
        } finally {
            setLoadingChats(false)
        }
    }, [])

    const fetchMessages = useCallback(async (jid: string) => {
        setLoadingMessages(true)
        try {
            const response = await getWhatsAppChatMessages(jid, 100)
            setMessages(response.data)
        } catch (error) {
            console.error('Failed to load chat messages:', error)
            setMessages([])
            toast.error('Gagal memuat pesan chat')
        } finally {
            setLoadingMessages(false)
        }
    }, [])

    useEffect(() => {
        void fetchChats()
        const interval = setInterval(() => void fetchChats(), 15_000)
        return () => clearInterval(interval)
    }, [fetchChats])

    useEffect(() => {
        if (!selectedChat) {
            setMessages([])
            return
        }
        void fetchMessages(selectedChat.id)
        const interval = setInterval(() => void fetchMessages(selectedChat.id), 5_000)
        return () => clearInterval(interval)
    }, [fetchMessages, selectedChat])

    const handleSelectChat = (chat: WhatsAppChat) => {
        setSelectedChat(chat)
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
                <CardTitle className="flex items-center gap-2">
                    <Inbox className="h-5 w-5" />
                    Percakapan
                </CardTitle>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                        void fetchChats()
                        if (selectedChat) void fetchMessages(selectedChat.id)
                    }}
                >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Muat ulang
                </Button>
            </CardHeader>
            <CardContent>
                <p className="mb-4 text-sm text-muted-foreground">
                    Menampilkan chat yang tersinkron dari sesi WhatsApp terhubung. Riwayat lama
                    muncul setelah sinkronisasi selesai; pesan masuk/keluar setelah koneksi ikut
                    tampil realtime.
                </p>

                <div className="grid min-h-[420px] gap-4 md:grid-cols-[280px_1fr]">
                    <div className="rounded-lg border bg-muted/20">
                        <div className="border-b px-3 py-2 text-sm font-medium">Daftar chat</div>
                        <ScrollArea className="h-[360px]">
                            {loadingChats ? (
                                <div className="flex items-center justify-center py-12 text-muted-foreground">
                                    <RefreshCw className="h-5 w-5 animate-spin" />
                                </div>
                            ) : chats.length === 0 ? (
                                <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                                    Belum ada chat. Hubungkan WhatsApp dan tunggu sinkronisasi.
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {chats.map((chat) => (
                                        <button
                                            key={chat.id}
                                            type="button"
                                            className={cn(
                                                'w-full px-3 py-3 text-left transition-colors hover:bg-muted/60',
                                                selectedChat?.id === chat.id && 'bg-muted',
                                            )}
                                            onClick={() => handleSelectChat(chat)}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        {chat.isGroup ? (
                                                            <Users className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                                        ) : (
                                                            <MessageCircle className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                                        )}
                                                        <span className="truncate font-medium">
                                                            {chat.name}
                                                        </span>
                                                    </div>
                                                    <p className="mt-1 truncate text-xs text-muted-foreground">
                                                        {chat.lastMessageText || '—'}
                                                    </p>
                                                </div>
                                                <div className="shrink-0 text-right">
                                                    <span className="text-[10px] text-muted-foreground">
                                                        {formatChatTime(chat.lastMessageTime)}
                                                    </span>
                                                    {chat.unreadCount > 0 && (
                                                        <Badge
                                                            variant="default"
                                                            className="mt-1 block px-1.5 py-0 text-[10px]"
                                                        >
                                                            {chat.unreadCount}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </div>

                    <div className="flex min-h-[360px] flex-col rounded-lg border">
                        {selectedChat ? (
                            <>
                                <div className="border-b px-4 py-3">
                                    <p className="font-medium">{selectedChat.name}</p>
                                    <p className="text-xs text-muted-foreground">{selectedChat.id}</p>
                                </div>
                                <ScrollArea className="flex-1 px-4 py-3">
                                    {loadingMessages && messages.length === 0 ? (
                                        <div className="flex items-center justify-center py-16 text-muted-foreground">
                                            <RefreshCw className="h-5 w-5 animate-spin" />
                                        </div>
                                    ) : messages.length === 0 ? (
                                        <div className="py-16 text-center text-sm text-muted-foreground">
                                            Belum ada pesan di chat ini.
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {messages.map((message) => (
                                                <div
                                                    key={message.id}
                                                    className={cn(
                                                        'flex',
                                                        message.fromMe ? 'justify-end' : 'justify-start',
                                                    )}
                                                >
                                                    <div
                                                        className={cn(
                                                            'max-w-[85%] rounded-2xl px-3 py-2 text-sm shadow-sm',
                                                            message.fromMe
                                                                ? 'bg-primary text-primary-foreground'
                                                                : 'bg-muted text-foreground',
                                                        )}
                                                    >
                                                        {!message.fromMe && message.pushName && (
                                                            <p className="mb-1 text-[11px] font-semibold opacity-80">
                                                                {message.pushName}
                                                            </p>
                                                        )}
                                                        <p className="whitespace-pre-wrap break-words">
                                                            {message.text || '[Pesan kosong]'}
                                                        </p>
                                                        <p
                                                            className={cn(
                                                                'mt-1 text-[10px]',
                                                                message.fromMe
                                                                    ? 'text-primary-foreground/70'
                                                                    : 'text-muted-foreground',
                                                            )}
                                                        >
                                                            {formatMessageTime(message.timestamp)}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </ScrollArea>
                            </>
                        ) : (
                            <div className="flex flex-1 items-center justify-center px-6 text-center text-sm text-muted-foreground">
                                Pilih chat di sebelah kiri untuk melihat pesan.
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}