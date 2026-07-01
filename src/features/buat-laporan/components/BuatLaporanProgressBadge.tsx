import { Badge } from '@/components/ui/badge'
import { formatProgressPercent, getProgressDisplayClasses } from '@/lib/progress-display'

type BuatLaporanProgressBadgeProps = {
    value: number | null
    loading?: boolean
}

export function BuatLaporanProgressBadge({ value, loading }: BuatLaporanProgressBadgeProps) {
    if (loading || value === null) {
        return (
            <div className="flex flex-col items-end gap-2 bg-background/60 backdrop-blur-sm p-4 rounded-2xl border border-primary/5 shadow-sm min-w-[180px]">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-tighter">
                    Progres Laporan
                </span>
                <Badge variant="outline" className="font-black text-lg px-3 py-0.5 rounded-full animate-pulse">
                    ...
                </Badge>
                <span className="text-[10px] text-muted-foreground">Memuat data laporan</span>
            </div>
        )
    }

    const { badgeClass } = getProgressDisplayClasses(value)

    return (
        <div className="flex flex-col items-end gap-2 bg-background/60 backdrop-blur-sm p-4 rounded-2xl border border-primary/5 shadow-sm min-w-[180px]">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-tighter">
                Progres Laporan
            </span>
            <Badge
                variant="default"
                className={`font-black text-lg px-3 py-0.5 rounded-full ${badgeClass}`}
            >
                {formatProgressPercent(value)}
            </Badge>
            <span className="text-[10px] text-muted-foreground text-right">
                Bobot tertimbang dari laporan progress fisik
            </span>
        </div>
    )
}