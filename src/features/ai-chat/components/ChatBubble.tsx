import ReactMarkdown from 'react-markdown'
import { Database, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { teksSumber } from '../lib/labels'
import type { SumberChat } from '../api/chat-stream'

export interface BubbleChat {
    role: 'user' | 'assistant'
    content: string
    sumber?: SumberChat[]
}

export function ChatBubble({ message }: { message: BubbleChat }) {
    if (message.role === 'user') {
        return (
            <div className="flex justify-end">
                <div className="max-w-[80%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm leading-relaxed text-primary-foreground shadow-sm">
                    <p className="whitespace-pre-wrap break-words">{message.content}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Sparkles className="h-4 w-4" aria-hidden />
            </div>
            <div className="min-w-0 max-w-[85%] space-y-3">
                <div className="rounded-2xl rounded-tl-md border bg-card px-4 py-3 text-sm leading-relaxed shadow-sm">
                    <div className="space-y-2 [&_li]:ml-4 [&_li]:list-disc [&_p]:leading-relaxed [&_strong]:font-semibold">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                </div>
                {message.sumber && message.sumber.length > 0 && (
                    <ul className="flex flex-wrap gap-1.5" aria-label="Sumber jawaban">
                        {message.sumber.map((s, i) => (
                            <li
                                key={`${s.tool}-${i}`}
                                className={cn(
                                    'inline-flex items-center gap-1.5 rounded-full border bg-muted/60 px-2.5 py-1 text-xs text-muted-foreground',
                                )}
                            >
                                <Database className="h-3 w-3" aria-hidden />
                                {teksSumber(s.tool, s.jumlah_baris)}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}

export function TypingIndicator({ label }: { label: string | null }) {
    return (
        <div className="flex items-center gap-3" role="status" aria-live="polite">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Sparkles className="h-4 w-4 animate-pulse" aria-hidden />
            </div>
            <div className="flex items-center gap-2 rounded-2xl rounded-tl-md border bg-card px-4 py-3 text-sm text-muted-foreground shadow-sm">
                <span className="flex gap-1" aria-hidden>
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/70 [animation-delay:-0.3s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/70 [animation-delay:-0.15s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/70" />
                </span>
                <span>{label ?? 'Memproses…'}</span>
            </div>
        </div>
    )
}
