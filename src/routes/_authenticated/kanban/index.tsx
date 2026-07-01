import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'
import { RouteSuspense } from '@/components/route-suspense'
import { lazyImport } from '@/lib/utils'

const KanbanPage = lazy(() =>
    lazyImport(() => import('@/features/kanban/components/KanbanPage'), 'kanban-page'),
)

function KanbanRoute() {
    return (
        <RouteSuspense label="Memuat Kanban...">
            <KanbanPage />
        </RouteSuspense>
    )
}

export const Route = createFileRoute('/_authenticated/kanban/')({
    component: KanbanRoute,
})