import { useMemo, useState } from 'react'
import { AlertCircle, Loader2 } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuthStore } from '@/stores/auth-stores'
import { computeBoardStats, filterKanbanBoard, sortColumns, type KanbanSourceFilter } from '../lib/kanban-board'
import { useKanbanBoard } from '../hooks/useKanban'
import { KanbanBoardView } from './KanbanBoardView'
import { KanbanHero } from './KanbanHero'

export default function KanbanPage() {
    const { auth } = useAuthStore()
    const isAdmin = auth.user?.roles?.includes('admin') ?? false
    const [importOpen, setImportOpen] = useState(false)
    const [search, setSearch] = useState('')
    const [sourceFilter, setSourceFilter] = useState<KanbanSourceFilter>('all')

    const { data: board, isLoading, isError, refetch, isFetching } = useKanbanBoard()

    const columns = useMemo(() => sortColumns(board?.columns ?? []), [board?.columns])
    const stats = useMemo(() => (board ? computeBoardStats(board) : null), [board])
    const filteredBoard = useMemo(
        () => (board ? filterKanbanBoard(board, { search, source: sourceFilter }) : null),
        [board, search, sourceFilter],
    )

    const hasActiveFilter = search.trim().length > 0 || sourceFilter !== 'all'
    const filteredTotal = filteredBoard ? computeBoardStats(filteredBoard).total : 0

    return (
        <>
            <Header fixed />

            <Main fixed className="flex min-h-0 flex-col gap-4 pb-4">
                {isLoading ? (
                    <KanbanPageSkeleton />
                ) : isError || !board || !filteredBoard || !stats ? (
                    <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/10 p-10 text-center">
                        <AlertCircle className="mb-3 h-10 w-10 text-muted-foreground" />
                        <p className="font-medium">Gagal memuat board kanban</p>
                        <p className="mt-1 text-sm text-muted-foreground">Periksa koneksi lalu coba lagi.</p>
                        <Button className="mt-4" variant="outline" onClick={() => refetch()}>
                            Coba lagi
                        </Button>
                    </div>
                ) : (
                    <>
                        <KanbanHero
                            title={board.title}
                            description={board.description}
                            columns={columns}
                            stats={stats}
                            canManage={isAdmin}
                            isRefreshing={isFetching}
                            search={search}
                            sourceFilter={sourceFilter}
                            onSearchChange={setSearch}
                            onSourceFilterChange={setSourceFilter}
                            onImport={() => setImportOpen(true)}
                            onRefresh={() => refetch()}
                        />

                        {hasActiveFilter && (
                            <p className="px-1 text-sm text-muted-foreground">
                                Menampilkan <span className="font-medium text-foreground tabular-nums">{filteredTotal}</span> dari{' '}
                                <span className="font-medium text-foreground tabular-nums">{stats.total}</span> kartu
                            </p>
                        )}

                        <div className="min-h-0 flex-1 overflow-hidden rounded-2xl border bg-muted/15 p-3 sm:p-4">
                            <KanbanBoardView
                                board={filteredBoard}
                                canManage={isAdmin}
                                importOpen={importOpen}
                                onImportOpenChange={setImportOpen}
                            />
                        </div>
                    </>
                )}
            </Main>
        </>
    )
}

function KanbanPageSkeleton() {
    return (
        <div className="space-y-4">
            <div className="rounded-2xl border p-6">
                <Skeleton className="h-8 w-56" />
                <Skeleton className="mt-2 h-4 w-96 max-w-full" />
                <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <Skeleton key={index} className="h-20 rounded-xl" />
                    ))}
                </div>
            </div>
            <div className="flex gap-4 overflow-hidden rounded-2xl border p-4">
                {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} className="h-[520px] w-80 shrink-0 rounded-xl" />
                ))}
            </div>
        </div>
    )
}