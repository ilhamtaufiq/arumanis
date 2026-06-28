import { formatProgressPercent, getProgressDisplayClasses } from '@/lib/progress-display'

type PekerjaanProgressCellProps = {
    value: number
    subtitle?: string
    minWidth?: string
    showBar?: boolean
    percentClassName?: string
}

export function PekerjaanProgressCell({
    value,
    subtitle,
    minWidth = 'min-w-[160px]',
    showBar = true,
    percentClassName = 'text-xs font-bold',
}: PekerjaanProgressCellProps) {
    const { textClass, bgClass } = getProgressDisplayClasses(value)

    return (
        <div className={`flex flex-col gap-1.5 ${minWidth}`}>
            <div className="flex justify-between items-center">
                <span className={`${percentClassName} ${textClass}`}>
                    {formatProgressPercent(value)}
                </span>
                {subtitle ? (
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">
                        {subtitle}
                    </span>
                ) : null}
            </div>
            {showBar ? (
                <div className="w-full bg-muted/40 h-2 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${bgClass}`}
                        style={{ width: `${Math.min(value, 100)}%` }}
                    />
                </div>
            ) : null}
        </div>
    )
}