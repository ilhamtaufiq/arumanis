import { PuspenButton } from '../PuspenUi'
import { puspenBorder, puspenShadowSm } from '../../lib/tokens'

type ReviewListPaginationProps = {
    page: number
    totalPages: number
    from: number
    to: number
    total: number
    filtered: number
    hasActiveFilters: boolean
    unitLabel: string
    onPageChange: (page: number) => void
}

export function ReviewListPagination({
    page,
    totalPages,
    from,
    to,
    total,
    filtered,
    hasActiveFilters,
    unitLabel,
    onPageChange,
}: ReviewListPaginationProps) {
    const summary = hasActiveFilters
        ? `${filtered} dari ${total} ${unitLabel} · filter aktif`
        : `${total} ${unitLabel}`

    if (totalPages <= 1) {
        return (
            <span className="text-xs font-bold text-[#111111]/65">
                {summary}
            </span>
        )
    }

    return (
        <div className="flex flex-wrap items-center justify-end gap-2">
            <span className="text-xs font-bold text-[#111111]/65">
                {from}–{to} · {summary}
            </span>
            <PuspenButton
                variant="ghost"
                className="px-3 py-1.5 text-xs"
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1}
            >
                Prev
            </PuspenButton>
            <div
                className={`bg-[#FFB703] px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] ${puspenBorder} ${puspenShadowSm}`}
            >
                Hal {page} / {totalPages}
            </div>
            <PuspenButton
                variant="ghost"
                className="px-3 py-1.5 text-xs"
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages}
            >
                Next
            </PuspenButton>
        </div>
    )
}
