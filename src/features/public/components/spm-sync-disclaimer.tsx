import { AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

type SpmSyncDisclaimerProps = {
    text: string
    className?: string
    theme?: 'dark' | 'light'
}

export function SpmSyncDisclaimer({ text, className, theme = 'dark' }: SpmSyncDisclaimerProps) {
    const isLight = theme === 'light'
    return (
        <div
            role="note"
            className={cn(
                'flex items-start gap-3 rounded-sm border-2 px-4 py-3 text-left',
                isLight
                    ? 'border-[#1C1C1C] bg-[#FCE954]/50 brutal-shadow'
                    : 'rounded-xl border border-amber-300/30 bg-amber-500/10 shadow-lg shadow-black/10 backdrop-blur-sm',
                className,
            )}
        >
            <AlertTriangle
                className={cn('mt-0.5 h-4 w-4 shrink-0', isLight ? 'text-[#1C1C1C]' : 'text-amber-200')}
                aria-hidden
            />
            <p className={cn('text-sm leading-relaxed', isLight ? 'text-[#1C1C1C]/85' : 'text-amber-50/90')}>
                {text}
            </p>
        </div>
    )
}