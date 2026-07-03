import { Headphones, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LiveChatMessage } from '../types'

type LiveChatMessageListProps = {
    messages: LiveChatMessage[]
    currentUserId?: number
    isAdminView?: boolean
}

export function LiveChatMessageList({
    messages,
    currentUserId,
    isAdminView = false,
}: LiveChatMessageListProps) {
    if (messages.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
                <Headphones className="h-10 w-10 text-muted-foreground/60" />
                <p className="mt-3 text-sm font-medium">Hubungi Admin</p>
                <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                    Kirim pesan dan tim admin akan membalas melalui live chat ini.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            {messages.map((message) => {
                const isMine = message.user_id === currentUserId

                return (
                    <div
                        key={message.id}
                        className={cn(
                            'flex gap-2 max-w-[92%] animate-in fade-in slide-in-from-bottom-2 duration-300',
                            isMine ? 'ml-auto flex-row-reverse' : 'mr-auto',
                        )}
                    >
                        <div
                            className={cn(
                                'flex h-7 w-7 shrink-0 items-center justify-center rounded-full shadow-sm',
                                isMine
                                    ? 'bg-primary text-primary-foreground'
                                    : 'border border-border bg-card text-muted-foreground',
                            )}
                        >
                            {isMine ? (
                                <User className="h-3.5 w-3.5" />
                            ) : (
                                <Headphones className="h-3.5 w-3.5 text-primary" />
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            {!isMine && (
                                <p className="mb-1 text-[10px] font-medium text-muted-foreground">
                                    {isAdminView ? message.user?.name || 'Pengguna' : 'Admin'}
                                </p>
                            )}
                            <div
                                className={cn(
                                    'rounded-2xl px-3 py-2 text-xs leading-relaxed shadow-sm whitespace-pre-wrap break-words',
                                    isMine
                                        ? 'rounded-tr-none bg-primary text-primary-foreground'
                                        : 'rounded-tl-none border border-border/50 bg-background/80',
                                )}
                            >
                                {message.message}
                            </div>
                            <p className="mt-1 text-[10px] text-muted-foreground">
                                {new Date(message.created_at).toLocaleTimeString('id-ID', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </p>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}