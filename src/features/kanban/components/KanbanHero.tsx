import {
    Columns3,
    Download,
    Eye,
    LayoutGrid,
    MessageSquare,
    PenLine,
    RefreshCw,
    Search,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { KanbanBoardStats, KanbanSourceFilter } from '../lib/kanban-board'
import type { KanbanColumn } from '../types'

type KanbanHeroProps = {
    title: string
    description?: string | null
    columns: KanbanColumn[]
    stats: KanbanBoardStats
    canManage: boolean
    isRefreshing?: boolean
    search: string
    sourceFilter: KanbanSourceFilter
    onSearchChange: (value: string) => void
    onSourceFilterChange: (value: KanbanSourceFilter) => void
    onImport: () => void
    onRefresh: () => void
}

const sourceFilters: { value: KanbanSourceFilter; label: string; icon: typeof LayoutGrid }[] = [
    { value: 'all', label: 'Semua', icon: LayoutGrid },
    { value: 'manual', label: 'Manual', icon: PenLine },
    { value: 'tiket', label: 'Dari Tiket', icon: MessageSquare },
]

export function KanbanHero({
    title,
    description,
    columns,
    stats,
    canManage,
    isRefreshing,
    search,
    sourceFilter,
    onSearchChange,
    onSourceFilterChange,
    onImport,
    onRefresh,
}: KanbanHeroProps) {
    return (
        <section className="overflow-hidden rounded-2xl border bg-gradient-to-br from-card via-card to-muted/40 shadow-sm">
            <div className="border-b bg-muted/20 px-3 py-4 sm:px-5 sm:py-5 md:px-6">
                <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 space-y-2">
                        <div className="flex items-start gap-2.5 sm:items-center sm:gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:h-10 sm:w-10">
                                <Columns3 className="h-4 w-4 sm:h-5 sm:w-5" />
                            </div>
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h1 className="text-balance text-xl font-bold tracking-tight sm:text-2xl">
                                        {title}
                                    </h1>
                                    {!canManage && (
                                        <Badge variant="secondary" className="gap-1">
                                            <Eye className="h-3 w-3" />
                                            Mode lihat
                                        </Badge>
                                    )}
                                </div>
                                {description && (
                                    <p className="mt-0.5 text-pretty text-sm text-muted-foreground">{description}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div
                        className={cn(
                            'flex flex-wrap items-center gap-2',
                            canManage && 'grid grid-cols-2 sm:flex',
                        )}
                    >
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onRefresh}
                            disabled={isRefreshing}
                            className="bg-background/80"
                        >
                            <RefreshCw className={cn('mr-2 h-4 w-4', isRefreshing && 'animate-spin')} />
                            Segarkan
                        </Button>
                        {canManage && (
                            <Button size="sm" onClick={onImport} className="shadow-sm">
                                <Download className="mr-2 h-4 w-4" />
                                <span className="sm:hidden">Impor</span>
                                <span className="hidden sm:inline">Impor Tiket</span>
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2 px-3 py-3 sm:gap-3 sm:px-5 sm:py-4 md:px-6 lg:grid-cols-4">
                <StatCard label="Total Kartu" value={stats.total} accent="bg-foreground" />
                {columns.map((column) => (
                    <StatCard
                        key={column.id}
                        label={column.title}
                        value={stats.byColumn[column.id] ?? 0}
                        accent="bg-primary"
                        dotColor={column.color}
                    />
                ))}
            </div>

            <div className="flex flex-col gap-3 border-t bg-background/60 px-3 py-3 sm:px-5 sm:py-4 md:flex-row md:items-center md:justify-between md:px-6">
                <div className="relative w-full md:max-w-sm">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Cari kartu, pekerjaan..."
                        className="bg-background pl-9"
                    />
                </div>

                <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] md:flex-wrap md:overflow-visible [&::-webkit-scrollbar]:hidden">
                    {sourceFilters.map((filter) => {
                        const Icon = filter.icon
                        const active = sourceFilter === filter.value
                        const count =
                            filter.value === 'all'
                                ? stats.total
                                : filter.value === 'manual'
                                  ? stats.manual
                                  : stats.fromTiket

                        return (
                            <Button
                                key={filter.value}
                                type="button"
                                size="sm"
                                variant={active ? 'default' : 'outline'}
                                className={cn('shrink-0', !active && 'bg-background/80')}
                                onClick={() => onSourceFilterChange(filter.value)}
                            >
                                <Icon className="mr-1.5 h-3.5 w-3.5" />
                                {filter.label}
                                <span className="ml-1.5 tabular-nums text-[11px] opacity-80">({count})</span>
                            </Button>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}

function StatCard({
    label,
    value,
    accent,
    dotColor,
}: {
    label: string
    value: number
    accent: string
    dotColor?: string | null
}) {
    return (
        <div className="rounded-xl border bg-background/80 px-3 py-2.5 shadow-sm sm:px-4 sm:py-3">
            <div className="flex min-w-0 items-center gap-2">
                {dotColor ? (
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: dotColor }} />
                ) : (
                    <span className={cn('h-2.5 w-2.5 shrink-0 rounded-full', accent)} />
                )}
                <p className="truncate text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:text-xs">
                    {label}
                </p>
            </div>
            <p className="mt-1.5 text-xl font-semibold tabular-nums tracking-tight sm:mt-2 sm:text-2xl">{value}</p>
        </div>
    )
}