import { useRef } from 'react'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

const MAX_CHARS = 2000

interface ComposerProps {
    value: string
    onChange: (value: string) => void
    onSubmit: () => void
    disabled: boolean
}

/** Kolom pertanyaan. Enter mengirim, Shift+Enter pindah baris. */
export function Composer({ value, onChange, onSubmit, disabled }: ComposerProps) {
    const ref = useRef<HTMLTextAreaElement>(null)
    const sisa = MAX_CHARS - value.length

    return (
        <form
            className="space-y-1.5"
            onSubmit={(e) => {
                e.preventDefault()
                onSubmit()
            }}
        >
            <div className="flex items-end gap-2 rounded-2xl border bg-card p-2 shadow-sm focus-within:ring-2 focus-within:ring-ring/40">
                <Textarea
                    ref={ref}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                            e.preventDefault()
                            if (value.trim() && !disabled) onSubmit()
                        }
                    }}
                    rows={1}
                    maxLength={MAX_CHARS}
                    placeholder="Tulis pertanyaan tentang data…"
                    aria-label="Pertanyaan"
                    disabled={disabled}
                    className="min-h-10 max-h-40 resize-none border-0 bg-transparent px-2 py-2 shadow-none focus-visible:ring-0"
                />
                <Button type="submit" size="icon" className="h-10 w-10 shrink-0 rounded-xl" disabled={disabled || !value.trim()} aria-label="Kirim pertanyaan">
                    <Send className="h-4 w-4" aria-hidden />
                </Button>
            </div>
            <div className="flex items-center justify-between px-2 text-[11px] text-muted-foreground">
                <span>Enter untuk kirim, Shift+Enter untuk baris baru</span>
                <span className={sisa < 100 ? 'text-amber-600 dark:text-amber-400' : undefined}>{sisa} karakter lagi</span>
            </div>
        </form>
    )
}
