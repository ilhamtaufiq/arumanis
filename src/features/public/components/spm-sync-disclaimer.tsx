import { AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

type SpmSyncDisclaimerProps = {
    text: string
    className?: string
}

export function SpmSyncDisclaimer({ text, className }: SpmSyncDisclaimerProps) {
    return (
        <div
            role="note"
            className={cn(
                'flex items-start gap-3 rounded-xl border border-amber-300/30 bg-amber-500/10 px-4 py-3 text-left shadow-lg shadow-black/10 backdrop-blur-sm',
                className,
            )}
        >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-200" aria-hidden />
            <p className="text-sm leading-relaxed text-amber-50/90">{text}</p>
        </div>
    )
}