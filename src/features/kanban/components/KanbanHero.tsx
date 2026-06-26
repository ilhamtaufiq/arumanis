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
            <div className="border-b bg-muted/20 px-5 py-5 sm:px-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <Columns3 className="h-5 w-5" />
                            </div>
                            <div>
                                <h1 className="text-balance text-2xl font-bold tracking-tight">{title}</h1>
                                {description && (
                                    <p className="text-pretty text-sm text-muted-foreground">{description}</p>
                                )}
                            </div>
                            {!canManage && (
                                <Badge variant="secondary" className="ml-1 gap-1">
                                    <Eye className="h-3 w-3" />
                                    Mode lihat
                                </Badge>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
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
                                Impor Tiket
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid gap-3 px-5 py-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
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

            <div className="flex flex-col gap-3 border-t bg-background/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div className="relative w-full sm:max-w-sm">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Cari kartu, pekerjaan, atau keterangan..."
                        className="bg-background pl-9"
                    />
                </div>

                <div className="flex flex-wrap gap-2">
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
                                className={cn(!active && 'bg-background/80')}
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
        <div className="rounded-xl border bg-background/80 px-4 py-3 shadow-sm">
            <div className="flex items-center gap-2">
                {dotColor ? (
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: dotColor }} />
                ) : (
                    <span className={cn('h-2.5 w-2.5 rounded-full', accent)} />
                )}
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
            </div>
            <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight">{value}</p>
        </div>
    )
}