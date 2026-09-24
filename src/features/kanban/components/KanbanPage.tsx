import { useMemo, useState } from 'react'
import { AlertCircle, LayoutGrid, TableProperties } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuthStore } from '@/stores/auth-stores'
import { computeBoardStats, filterKanbanBoard, sortColumns, type KanbanSourceFilter } from '../lib/kanban-board'
import { useKanbanBoard } from '../hooks/useKanban'
import { KanbanBoardView } from './KanbanBoardView'
import { KanbanHero } from './KanbanHero'
import { KanbanTableView } from './KanbanTableView'

type KanbanViewMode = 'board' | 'table'

const KANBAN_VIEW_STORAGE_KEY = 'kanban-view-mode'

function getInitialViewMode(): KanbanViewMode {
    if (typeof window === 'undefined') return 'board'
    return window.localStorage.getItem(KANBAN_VIEW_STORAGE_KEY) === 'table' ? 'table' : 'board'
}

export default function KanbanPage() {
    const { auth } = useAuthStore()
    const isAdmin = auth.user?.roles?.includes('admin') ?? false
    const [importOpen, setImportOpen] = useState(false)
    const [search, setSearch] = useState('')
    const [sourceFilter, setSourceFilter] = useState<KanbanSourceFilter>('all')
    const [viewMode, setViewMode] = useState<KanbanViewMode>(getInitialViewMode)

    const { data: board, isLoading, isError, refetch, isFetching } = useKanbanBoard()

    const columns = useMemo(() => sortColumns(board?.columns ?? []), [board?.columns])
    const stats = useMemo(() => (board ? computeBoardStats(board) : null), [board])
    const filteredBoard = useMemo(
        () => (board ? filterKanbanBoard(board, { search, source: sourceFilter }) : null),
        [board, search, sourceFilter],
    )

    const hasActiveFilter = search.trim().length > 0 || sourceFilter !== 'all'
    const filteredTotal = filteredBoard ? computeBoardStats(filteredBoard).total : 0

    const handleViewModeChange = (mode: KanbanViewMode) => {
        setViewMode(mode)
        window.localStorage.setItem(KANBAN_VIEW_STORAGE_KEY, mode)
    }

    return (
        <>
            <Header fixed />

            <Main fixed className="flex min-h-0 flex-col gap-3 pb-3 sm:gap-4 sm:pb-4">
                {isLoading ? (
                    <KanbanPageSkeleton />
                ) : isError || !board || !filteredBoard || !stats ? (
                    <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/10 p-6 text-center sm:p-10">
                        <AlertCircle className="mb-3 h-9 w-9 text-muted-foreground sm:h-10 sm:w-10" />
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

                        <div className='flex items-center justify-between gap-2'>
                            {hasActiveFilter ? (
                                <p className='px-0.5 text-xs text-muted-foreground sm:px-1 sm:text-sm'>
                                    Menampilkan{' '}
                                    <span className='font-medium tabular-nums text-foreground'>{filteredTotal}</span>{' '}
                                    dari{' '}
                                    <span className='font-medium tabular-nums text-foreground'>{stats.total}</span>{' '}
                                    kartu
                                </p>
                            ) : (
                                <p className='px-0.5 text-xs text-muted-foreground sm:px-1 sm:text-sm'>
                                    <span className='font-medium tabular-nums text-foreground'>{stats.total}</span>{' '}
                                    kartu
                                </p>
                            )}
                            <div className='flex shrink-0 items-center gap-1 rounded-lg border bg-card p-1'>
                                <Button
                                    type='button'
                                    size='sm'
                                    variant={viewMode === 'board' ? 'default' : 'ghost'}
                                    className='h-7 gap-1.5 px-2.5 text-xs'
                                    onClick={() => handleViewModeChange('board')}
                                    aria-pressed={viewMode === 'board'}
                                >
                                    <LayoutGrid className='h-3.5 w-3.5' />
                                    <span className='hidden sm:inline'>Board</span>
                                </Button>
                                <Button
                                    type='button'
                                    size='sm'
                                    variant={viewMode === 'table' ? 'default' : 'ghost'}
                                    className='h-7 gap-1.5 px-2.5 text-xs'
                                    onClick={() => handleViewModeChange('table')}
                                    aria-pressed={viewMode === 'table'}
                                >
                                    <TableProperties className='h-3.5 w-3.5' />
                                    <span className='hidden sm:inline'>Tabel</span>
                                </Button>
                            </div>
                        </div>

                        <div className='min-h-0 flex-1 overflow-hidden rounded-xl border bg-muted/15 p-2 sm:rounded-2xl sm:p-3 md:p-4'>
                            {viewMode === 'board' ? (
                                <KanbanBoardView
                                    board={filteredBoard}
                                    canManage={isAdmin}
                                    importOpen={importOpen}
                                    onImportOpenChange={setImportOpen}
                                />
                            ) : (
                                <div className='h-full overflow-auto'>
                                    <KanbanTableView board={filteredBoard} canManage={isAdmin} />
                                </div>
                            )}
                        </div>
                    </>
                )}
            </Main>
        </>
    )
}

function KanbanPageSkeleton() {
    return (
        <div className="space-y-3 sm:space-y-4">
            <div className="rounded-2xl border p-4 sm:p-6">
                <Skeleton className="h-7 w-40 sm:h-8 sm:w-56" />
                <Skeleton className="mt-2 h-4 w-full max-w-sm" />
                <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-6 sm:gap-3 lg:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <Skeleton key={index} className="h-16 rounded-xl sm:h-20" />
                    ))}
                </div>
            </div>
            <div className="flex gap-3 overflow-hidden rounded-xl border p-2 sm:gap-4 sm:rounded-2xl sm:p-4">
                {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton
                        key={index}
                        className="h-[min(58dvh,520px)] w-[min(85vw,320px)] shrink-0 rounded-xl sm:w-[300px]"
                    />
                ))}
            </div>
        </div>
    )
}