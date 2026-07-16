import { AlertCircle, Calendar } from 'lucide-react'
import { formatRegisterDate } from '../../lib/register-dokumen'

type DocumentCellProps = {
    num: string | null | undefined
    date: string | null | undefined
    label: string
}

export function DocumentCell({ num, date, label }: DocumentCellProps) {
    const isMissing = !num

    return (
        <div className="flex min-w-[140px] flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {label}
            </span>
            {isMissing ? (
                <div className="flex items-center gap-1.5 rounded border border-dashed border-destructive/20 bg-destructive/5 px-2 py-1 text-destructive">
                    <AlertCircle size={14} />
                    <span className="text-xs font-medium italic">Belum Ada</span>
                </div>
            ) : (
                <div className="group">
                    <div
                        className="wrap-break-word text-sm font-semibold tabular-nums text-foreground"
                        title={num!}
                    >
                        {num}
                    </div>
                    <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Calendar size={10} />
                        {formatRegisterDate(date)}
                    </div>
                </div>
            )}
        </div>
    )
}
