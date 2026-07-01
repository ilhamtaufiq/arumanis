export type ProgressTone = 'complete' | 'high' | 'medium' | 'low' | 'minimal'

export function getProgressTone(value: number): ProgressTone {
    if (value >= 100) return 'complete'
    if (value >= 75) return 'high'
    if (value >= 50) return 'medium'
    if (value >= 25) return 'low'
    return 'minimal'
}

const TONE_STYLES: Record<
    ProgressTone,
    { textClass: string; bgClass: string; badgeClass: string }
> = {
    complete: {
        textClass: 'text-green-600',
        bgClass: 'bg-green-600',
        badgeClass: 'bg-green-600 hover:bg-green-700',
    },
    high: {
        textClass: 'text-emerald-500',
        bgClass: 'bg-emerald-500',
        badgeClass: 'bg-emerald-500 hover:bg-emerald-600',
    },
    medium: {
        textClass: 'text-amber-500',
        bgClass: 'bg-amber-500',
        badgeClass: 'bg-amber-500 hover:bg-amber-600',
    },
    low: {
        textClass: 'text-orange-500',
        bgClass: 'bg-orange-500',
        badgeClass: 'bg-orange-500 hover:bg-orange-600',
    },
    minimal: {
        textClass: 'text-rose-500',
        bgClass: 'bg-rose-500',
        badgeClass: 'bg-rose-500 hover:bg-rose-700',
    },
}

export function getProgressDisplayClasses(value: number) {
    return TONE_STYLES[getProgressTone(value)]
}

export function formatProgressPercent(value: number) {
    return `${value.toFixed(2)}%`
}