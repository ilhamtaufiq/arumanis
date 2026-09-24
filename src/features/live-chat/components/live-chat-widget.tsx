import { Headphones, Loader2, Minus, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useLiveChat } from '../hooks/use-live-chat'
import { useLiveChatOpenStore } from '../store/live-chat-open-store'
import { LiveChatMessageList } from './live-chat-message-list'

export function LiveChatWidget() {
    const isOpen = useLiveChatOpenStore((state) => state.isOpen)
    const setIsOpen = useLiveChatOpenStore((state) => state.setIsOpen)
    const {
        isAdmin,
        currentUserId,
        inbox,
        activeThreadId,
        messages,
        input,
        setInput,
        isSending,
        isClosed,
        isLoading,
        scrollRef,
        handleSend,
        handleCloseThread,
        selectThread,
    } = useLiveChat({ enabled: true })

    if (!isOpen) {
        return null
    }

    return (
        <div className="pointer-events-none fixed bottom-0 right-0 z-50 flex flex-col items-end p-4 sm:p-6">
                <div
                    className={cn(
                        'pointer-events-auto mb-3 flex w-[min(100vw-2rem,24rem)] flex-col overflow-hidden rounded-2xl border border-border/60 bg-background/95 shadow-2xl backdrop-blur-xl',
                        'animate-in fade-in slide-in-from-bottom-4 zoom-in-95 duration-300',
                        'h-[min(70vh,32rem)] sm:h-[min(72vh,34rem)]',
                    )}
                    role="dialog"
                    aria-label="Live chat dengan admin"
                >
                    <div className="flex shrink-0 items-center justify-between gap-2 border-b bg-emerald-500/5 px-4 py-3">
                        <div className="flex min-w-0 items-center gap-2.5">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
                                <Headphones className="h-4 w-4 text-emerald-600" />
                            </div>
                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold">Live Chat Admin</p>
                                <p className="truncate text-[11px] text-muted-foreground">
                                    {isAdmin
                                        ? 'Balas pesan pengguna'
                                        : 'Tim admin Arumanis'}
                                </p>
                            </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-0.5">
                            {activeThreadId && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-2 text-[11px]"
                                    onClick={() => void handleCloseThread()}
                                >
                                    Tutup
                                </Button>
                            )}
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setIsOpen(false)}
                                title="Minimalkan"
                            >
                                <Minus className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {isAdmin && (
                        <div className="shrink-0 border-b">
                            <div className="max-h-28 overflow-y-auto p-2 space-y-1">
                                {isLoading && inbox.length === 0 ? (
                                    <div className="flex justify-center py-4">
                                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                    </div>
                                ) : inbox.length === 0 ? (
                                    <p className="px-2 py-3 text-center text-xs text-muted-foreground">
                                        Belum ada percakapan masuk.
                                    </p>
                                ) : (
                                    inbox.map((thread) => (
                                        <button
                                            key={thread.id}
                                            type="button"
                                            onClick={() => selectThread(thread)}
                                            className={cn(
                                                'flex w-full items-start gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition-colors',
                                                activeThreadId === thread.id
                                                    ? 'bg-primary/10 text-primary'
                                                    : 'hover:bg-muted/60',
                                            )}
                                        >
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate font-medium">
                                                    {thread.user?.name || `User #${thread.user_id}`}
                                                </p>
                                                <p className="truncate text-[10px] text-muted-foreground">
                                                    {thread.latest_message?.message || 'Belum ada pesan'}
                                                </p>
                                            </div>
                                            {(thread.unread_count ?? 0) > 0 && (
                                                <Badge variant="destructive" className="h-5 min-w-5 px-1 text-[10px]">
                                                    {thread.unread_count}
                                                </Badge>
                                            )}
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
                        {isLoading && !activeThreadId ? (
                            <div className="flex h-full items-center justify-center">
                                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                            </div>
                        ) : isAdmin && !activeThreadId ? (
                            <div className="flex h-full items-center justify-center px-4 text-center text-xs text-muted-foreground">
                                Pilih percakapan pengguna untuk mulai membalas.
                            </div>
                        ) : (
                            <LiveChatMessageList
                                messages={messages}
                                currentUserId={currentUserId}
                                isAdminView={isAdmin}
                            />
                        )}
                    </div>

                    <div className="shrink-0 border-t bg-background/80 p-3">
                        {isClosed && (
                            <p className="mb-2 text-center text-[11px] text-muted-foreground">
                                Percakapan ditutup. Kirim pesan baru untuk membuka kembali.
                            </p>
                        )}
                        <form
                            onSubmit={(e) => {
                                e.preventDefault()
                                void handleSend()
                            }}
                            className="flex gap-2"
                        >
                            <Input
                                placeholder={
                                    isAdmin && !activeThreadId
                                        ? 'Pilih percakapan dulu...'
                                        : isAdmin
                                          ? 'Balas pengguna...'
                                          : 'Ketik pesan ke admin...'
                                }
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                disabled={isSending || !activeThreadId}
                                className="h-9 flex-1 bg-card text-sm"
                            />
                            <Button
                                type="submit"
                                size="icon"
                                className="h-9 w-9 shrink-0"
                                disabled={isSending || !input.trim() || !activeThreadId}
                            >
                                {isSending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4" />
                                )}
                            </Button>
                        </form>
                        {!isAdmin && (
                            <p className="mt-2 text-center text-[10px] text-muted-foreground">
                                Butuh bantuan teknis? Gunakan menu Tiket untuk laporan detail.
                            </p>
                        )}
                    </div>
                </div>
        </div>
    )
}